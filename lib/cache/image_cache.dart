// 网络图片的磁盘缓存：封面、头像下载一次存进 cache/images，重启后不用再下。
// 和 API 缓存分开算容量（上限 2 GB），超了删最久没用过的。
// 封面显示（DiskCachedImage）和取主色（CoverTone）用同一份，只下载一次。

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

  /// 缓存目录；没设（测试里）就只下载不存。
  String? dir;
  int maxBytes = 2 << 30; // 2 GB

  // 部分图床 CDN 会拦截 Dart 默认 UA 返回 403，
  // 且 Dart HttpClient 不会自动读取 macOS 系统代理。
  final HttpClient _http = _createHttp();

  // 不能用 HttpClient.maxConnectionsPerHost：走代理访问 https 时，排队的请求
  // 挂在代理那一组上，建好的隧道却算到目标主机那一组，排队的请求永远不会被唤醒，
  // 一直挂到超时（Dart SDK 的问题），表现为一部分图片加载不出来。所以自己限并发。
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
    // 用 UTF-8 字节算：codeUnits 是 UTF-16，超过 255 的会被截断，
    // 带中文的地址会和别的地址撞上同一个文件
    final h = sha1.convert(utf8.encode(url)).toString();
    return p.join(dir!, h.substring(0, 2), '$h.img');
  }

  /// [url] 的图片数据：磁盘上有就读，没有就下载并存盘。同一张同时只下载一次。
  Future<Uint8List> bytes(String url) =>
      // 回调不能写成 `=> _inflight.remove(url)`：remove 返回的就是这个 future 本身，
      // whenComplete 会等它完成，等于自己等自己，永远不结束（图片全部空白）。
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
            // 读到了更新文件时间：清理时按它判断最久没用过的
            f.setLastModified(DateTime.now()).ignore();
            return b;
          }
        }
      } on FileSystemException {
        // 读不了就重新下
      }
    }
    final b = await _download(url);
    if (d != null) _save(_path(url), b);
    return b;
  }

  /// 整个下载（等响应 + 读完数据）的上限。
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
    // 连接走代理时，代理重启或断网会让请求一直挂着、既不成功也不报错。
    // 这个 future 会留在 _inflight 里，之后每次显示同一张图都复用它，
    // 图片就永远出不来（直到重启 App）。所以必须有总超时，超时后中断请求，
    // 报错后 DiskCachedImage 会把自己从内存缓存移掉，下次显示重新下载。
    final uri = Uri.parse(url);
    final req = await _http.getUrl(uri).timeout(_timeout);
    try {
      return await () async {
        final res = await req.close();
        if (res.statusCode != HttpStatus.ok) {
          await res.drain<void>();
          throw HttpException('图片下载失败（HTTP ${res.statusCode}）', uri: uri);
        }
        final b = await consolidateHttpClientResponseBytes(res);
        if (b.isEmpty) throw HttpException('图片是空的', uri: uri);
        return b;
      }().timeout(_timeout);
    } on TimeoutException {
      req.abort();
      throw HttpException('图片下载超时', uri: uri);
    }
  }

  /// 正在存盘的：evict 要等它写完再删，否则刚删完又被写回来。
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

  /// 删掉 [url] 在磁盘上的那份（比如存下来的其实不是图片，解码失败）。
  Future<void> evict(String url) async {
    if (dir == null) return;
    final path = _path(url);
    await _saving[path];
    try {
      final f = File(path);
      if (await f.exists()) await f.delete();
    } on FileSystemException {
      // 删不了下次再说
    }
  }

  /// 已经占用的字节数。
  Future<int> size() async {
    final d = dir;
    if (d == null || !await Directory(d).exists()) return _bytes = 0;
    var n = 0;
    await for (final f in Directory(d).list(recursive: true)) {
      if (f is File) n += await f.length();
    }
    return _bytes = n;
  }

  /// 超过上限时删最久没用过的，删到上限的九成。
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
          // 下次再说
        }
      }
      _bytes = n;
    } catch (e) {
      debugPrint('image cache trim: $e');
    } finally {
      _trimming = false;
    }
  }

  /// 清空磁盘上的图片（内存里已经解码的不动）。
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

/// 先看磁盘缓存的网络图片。和 NetworkImage 一样用，按 url 区分。
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
      // 下载失败别留在内存缓存里，下次显示时再试
      scheduleMicrotask(() => PaintingBinding.instance.imageCache.evict(this));
      rethrow;
    }
    try {
      return await decode(await ui.ImmutableBuffer.fromUint8List(b));
    } catch (_) {
      // 存下来的不是图片（错误页、被截断）：磁盘上那份也删掉，否则以后每次都读到
      // 这份坏数据、永远不重新下载。
      await ImageDiskCache.instance.evict(url);
      // 内存缓存里也不留
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
