// Disk cache for network images: covers and avatars are downloaded once into cache/images and survive restarts.
// Its size is counted separately from the API cache (cap 2 GB); over the cap, the least recently used are deleted.
// Cover display (DiskCachedImage) and dominant color (CoverTone) share one copy and download only once.

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';
import 'package:path/path.dart' as p;

import '../net/proxy.dart';

class ImageDiskCache {
  ImageDiskCache._();
  static final instance = ImageDiskCache._();

  /// Cache directory; when unset (in tests) images are downloaded but not stored.
  String? dir;
  int maxBytes = 2 << 30; // 2 GB

  // Some image CDNs block Dart's default UA with 403,
  // and Dart's HttpClient doesn't read the macOS system proxy on its own.
  final HttpClient _http = _createHttp();

  // Can't use HttpClient.maxConnectionsPerHost: through a proxy to https, queued requests
  // wait in the proxy's group while the established tunnel counts toward the target host's group, so they are never woken up
  // and hang until timeout (a Dart SDK issue), showing up as some images never loading. So we limit concurrency ourselves.
  static const _maxDownloads = 8;
  int _downloading = 0;
  final _waiting = <Completer<void>>[];

  static HttpClient _createHttp() {
    final c = HttpClient()
      ..connectionTimeout = const Duration(seconds: 15)
      ..idleTimeout = const Duration(seconds: 10)
      ..userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          'AppleWebKit/537.36 (KHTML, like Gecko) '
          'Chrome/131.0.0.0 Safari/537.36';
    final proxy = systemProxy();
    if (proxy != null) c.findProxy = proxy.findProxy;
    return c;
  }

  final Map<String, Future<Uint8List>> _inflight = {};
  int? _bytes;
  bool _trimming = false;
  Timer? _trimTimer;

  String _path(String url) {
    // Hash UTF-8 bytes: codeUnits are UTF-16 and anything above 255 gets truncated,
    // so URLs containing CJK would collide on the same file
    final h = sha1.convert(utf8.encode(url)).toString();
    return p.join(dir!, h.substring(0, 2), '$h.img');
  }

  /// Image data for [url]: read from disk if present, otherwise download and store. Only one download per image at a time.
  Future<Uint8List> bytes(String url) =>
      // The callback must not be `=> _inflight.remove(url)`: remove returns this very future,
      // and whenComplete would wait for it, i.e. wait for itself forever (all images blank).
      _inflight[url] ??= _get(url).whenComplete(() {
        _inflight.remove(url);
      });

  Future<Uint8List> _get(String url) async {
    final d = dir;
    if (d != null) {
      final f = File(_path(url));
      try {
        if (await f.exists()) {
          final b = await f.readAsBytes();
          if (b.isNotEmpty) {
            // Touch the file time on read: cleanup uses it to find the least recently used
            f.setLastModified(DateTime.now()).ignore();
            return b;
          }
        }
      } on FileSystemException {
        // Can't read it, download again
      }
    }
    final b = await _download(url);
    if (d != null) _save(_path(url), b);
    return b;
  }

  /// Limit for the whole download (waiting for the response + reading the data).
  static const _timeout = Duration(seconds: 30);

  Future<Uint8List> _download(String url) async {
    if (_downloading >= _maxDownloads) {
      final c = Completer<void>();
      _waiting.add(c);
      await c.future;
    }
    _downloading++;
    try {
      return await _fetch(url);
    } finally {
      _downloading--;
      if (_waiting.isNotEmpty) _waiting.removeAt(0).complete();
    }
  }

  Future<Uint8List> _fetch(String url) async {
    // Through a proxy, a proxy restart or network loss leaves the request hanging, neither succeeding nor failing.
    // The future stays in _inflight and every later display of the same image reuses it,
    // so the image never appears (until the app restarts). Hence the overall timeout: abort the request on timeout,
    // and after the error DiskCachedImage evicts itself from the memory cache and downloads again next time.
    final uri = Uri.parse(url);
    final req = await _http.getUrl(uri).timeout(_timeout);
    try {
      return await () async {
        final res = await req.close();
        if (res.statusCode != HttpStatus.ok) {
          await res.drain<void>();
          throw HttpException(
            'Image download failed (HTTP ${res.statusCode})',
            uri: uri,
          );
        }
        final b = await consolidateHttpClientResponseBytes(res);
        if (b.isEmpty) throw HttpException('Image is empty', uri: uri);
        return b;
      }().timeout(_timeout);
    } on TimeoutException {
      req.abort();
      throw HttpException('Image download timed out', uri: uri);
    }
  }

  /// Being stored: evict must wait for the write to finish, or it gets written back right after deletion.
  final Map<String, Future<void>> _saving = {};

  void _save(String path, Uint8List b) {
    late final Future<void> w;
    w = () async {
      try {
        final f = File(path);
        await f.parent.create(recursive: true);
        final tmp = File('$path.${b.length}.tmp');
        await tmp.writeAsBytes(b, flush: true);
        await tmp.rename(path);
        if (_bytes != null) _bytes = _bytes! + b.length;
        _trimTimer?.cancel();
        _trimTimer = Timer(const Duration(seconds: 5), () => trim().ignore());
      } on FileSystemException catch (e) {
        debugPrint('image cache: $e');
      } finally {
        if (identical(_saving[path], w)) _saving.remove(path);
      }
    }();
    _saving[path] = w;
  }

  /// Deletes the on-disk copy of [url] (e.g. what was stored isn't actually an image and failed to decode).
  Future<void> evict(String url) async {
    if (dir == null) return;
    final path = _path(url);
    await _saving[path];
    try {
      final f = File(path);
      if (await f.exists()) await f.delete();
    } on FileSystemException {
      // Can't delete it, try next time
    }
  }

  /// Bytes in use.
  Future<int> size() async {
    final d = dir;
    if (d == null || !await Directory(d).exists()) return _bytes = 0;
    var n = 0;
    await for (final f in Directory(d).list(recursive: true)) {
      if (f is File) n += await f.length();
    }
    return _bytes = n;
  }

  /// Over the cap, deletes the least recently used down to 90% of the cap.
  Future<void> trim() async {
    final d = dir;
    if (d == null || _trimming) return;
    _trimming = true;
    try {
      final total = _bytes ?? await size();
      if (total <= maxBytes) return;
      final files = <(File, DateTime, int)>[];
      await for (final f in Directory(d).list(recursive: true)) {
        if (f is File) {
          final st = await f.stat();
          files.add((f, st.modified, st.size));
        }
      }
      files.sort((a, b) => a.$2.compareTo(b.$2));
      var n = total;
      for (final (f, _, sz) in files) {
        if (n <= maxBytes * 0.9) break;
        try {
          await f.delete();
          n -= sz;
        } on FileSystemException {
          // Try next time
        }
      }
      _bytes = n;
    } catch (e) {
      debugPrint('image cache trim: $e');
    } finally {
      _trimming = false;
    }
  }

  /// Clears images on disk (images already decoded in memory are untouched).
  Future<void> clear() async {
    final d = dir;
    if (d == null) return;
    try {
      final dd = Directory(d);
      if (await dd.exists()) await dd.delete(recursive: true);
    } on FileSystemException catch (e) {
      debugPrint('image cache clear: $e');
    }
    _bytes = 0;
  }
}

/// Network image that checks the disk cache first. Used like NetworkImage, keyed by url.
@immutable
class DiskCachedImage extends ImageProvider<DiskCachedImage> {
  const DiskCachedImage(this.url);
  final String url;

  @override
  Future<DiskCachedImage> obtainKey(ImageConfiguration configuration) =>
      SynchronousFuture(this);

  @override
  ImageStreamCompleter loadImage(
    DiskCachedImage key,
    ImageDecoderCallback decode,
  ) => MultiFrameImageStreamCompleter(
    codec: _load(decode),
    scale: 1,
    debugLabel: url,
  );

  Future<ui.Codec> _load(ImageDecoderCallback decode) async {
    final Uint8List b;
    try {
      b = await ImageDiskCache.instance.bytes(url);
    } catch (_) {
      // Don't keep a failed download in the memory cache; retry on next display
      scheduleMicrotask(() => PaintingBinding.instance.imageCache.evict(this));
      rethrow;
    }
    try {
      return await decode(await ui.ImmutableBuffer.fromUint8List(b));
    } catch (_) {
      // What was stored isn't an image (error page, truncated): delete the disk copy too, or every
      // later read gets this bad data and it is never downloaded again.
      await ImageDiskCache.instance.evict(url);
      // Don't keep it in the memory cache either
      scheduleMicrotask(() => PaintingBinding.instance.imageCache.evict(this));
      rethrow;
    }
  }

  @override
  bool operator ==(Object other) =>
      other is DiskCachedImage && other.url == url;

  @override
  int get hashCode => url.hashCode;

  @override
  String toString() => 'DiskCachedImage("$url")';
}
