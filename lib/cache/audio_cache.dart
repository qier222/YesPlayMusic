// 流媒体音频文件的磁盘缓存：下载一次存进 cache/audio，缓存有效期内直接播
// 本地文件，不做 SWR 后台重取。默认有效期一个月（30 天），上限 1 GB；
// 清理时先删过期文件，仍超上限再按最久没播过的删（播到时会更新文件时间）。
//
// 磁盘布局：<dir>/<命名空间>/<key 的哈希>.json + <key 的哈希>.<扩展名>。
// 命名空间是 key 第一个 / 之前的部分（「源@账号」），换账号互不污染（比如
// 未登录时的试听片段不会盖住登录后的完整音频）。写盘先写 .tmp 再改名。

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import '../music/models.dart';
import '../net/proxy.dart';

class AudioDiskCache {
  AudioDiskCache({
    required this.dir,
    this.maxBytes = 1 << 30, // 1 GB
    this.ttl = const Duration(days: 30),
    this.version = 1,
    DateTime Function()? now,
    HttpClient? http,
    this.idleTimeout = const Duration(seconds: 60),
  }) : _now = now ?? DateTime.now,
       _http = http ?? _createHttp();

  final String dir;
  final int maxBytes;

  /// 缓存有效期：超过这么久视为过期，删除并重新拉取。
  final Duration ttl;

  /// 缓存格式版本：改了存盘格式就加一，旧文件作废。
  final int version;
  final DateTime Function() _now;
  final HttpClient _http;

  static HttpClient _createHttp() {
    final c = HttpClient()
      ..connectionTimeout = const Duration(seconds: 20)
      // 不设 maxConnectionsPerHost：走代理访问 https 时排队的请求不会被唤醒，
      // 会一直挂着（Dart SDK 的问题，见 image_cache.dart）。
      ..userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          'AppleWebKit/537.36 (KHTML, like Gecko) '
          'Chrome/131.0.0.0 Safari/537.36';
    final proxy = systemProxy();
    if (proxy != null) c.findProxy = proxy.findProxy;
    return c;
  }

  /// 等响应头、两块数据之间的最长间隔；超过就放弃这次缓存。
  final Duration idleTimeout;

  final Map<String, _DownloadTask> _inflight = {};
  int _nextTaskId = 0;
  int _clearGen = 0;
  int? _bytes;
  bool _trimming = false;
  bool _disposed = false;
  Timer? _trimTimer;

  /// 这条音频流能不能按单个文件缓存（跳过本地文件和 HLS/DASH 分片清单）。
  static bool isCacheable(AudioStream s) {
    final uri = Uri.tryParse(s.url);
    if (uri == null || (uri.scheme != 'http' && uri.scheme != 'https')) {
      return false;
    }
    final type = s.type.trim().toLowerCase();
    if (type == 'm3u8' || type == 'hls' || type == 'mpd' || type == 'dash') {
      return false;
    }
    final path = uri.path.toLowerCase();
    if (path.endsWith('.m3u8') || path.endsWith('.mpd')) return false;
    return true;
  }

  // ── 读 ──

  /// 查磁盘缓存：命中且未过期时返回指向本地文件的 [AudioStream]；
  /// 已过期或文件损坏时清理并返回 null。
  Future<AudioStream?> get(String key) async {
    if (_disposed) return null;
    final metaFile = File(_metaPath(key));
    try {
      if (!await metaFile.exists()) return null;
      final j = jsonDecode(await metaFile.readAsString());
      if (j is! Map || j['v'] != version || j['key'] != key) {
        await _deleteSafe(metaFile);
        return null;
      }
      final atMs = j['at'];
      final fileName = j['file'];
      if (atMs is! int ||
          fileName is! String ||
          fileName.isEmpty ||
          p.basename(fileName) != fileName) {
        await _deleteSafe(metaFile);
        return null;
      }
      final audioFile = File(p.join(metaFile.parent.path, fileName));
      final at = DateTime.fromMillisecondsSinceEpoch(atMs);
      if (_now().difference(at) > ttl) {
        await _deleteEntry(metaFile, audioFile);
        return null;
      }
      if (!await audioFile.exists()) {
        await _deleteSafe(metaFile);
        return null;
      }
      final len = await audioFile.length();
      if (len <= 0) {
        await _deleteEntry(metaFile, audioFile);
        return null;
      }
      // 播到了就更新文件时间：清理时按它判断最久没用过的；json 里的 at 不变
      audioFile.setLastModified(_now()).ignore();
      return AudioStream(
        url: Uri.file(audioFile.path).toString(),
        type: '${j['type'] ?? ''}',
        quality: '${j['quality'] ?? ''}',
        bitRate: (j['bitRate'] as num?)?.toInt() ?? 0,
        size: (j['size'] as num?)?.toInt() ?? len,
        peak: (j['peak'] as num?)?.toDouble() ?? 0,
        gain: (j['gain'] as num?)?.toDouble() ?? 0,
      );
    } catch (_) {
      return null;
    }
  }

  // ── 写（后台下载缓存） ──

  /// 下载 [stream] 并持久化到磁盘。同一个 [key] 同时只下载一次；出错不抛出。
  Future<void> cache(String key, AudioStream stream) {
    if (_disposed || !isCacheable(stream)) return Future.value();
    final existing = _inflight[key];
    if (existing != null && !existing.cancelled) return existing.done;

    final task = _DownloadTask(++_nextTaskId, _clearGen);
    _inflight[key] = task;
    task.done = _download(key, stream, task).whenComplete(() {
      if (identical(_inflight[key], task)) _inflight.remove(key);
    });
    return task.done;
  }

  /// 取消某个 [key] 正在进行的缓存下载。
  void cancel(String key) {
    final task = _inflight.remove(key);
    task?.cancel();
  }

  /// 取消所有正在进行的缓存下载。
  void cancelAll() {
    final tasks = _inflight.values.toList();
    _inflight.clear();
    for (final t in tasks) {
      t.cancel();
    }
  }

  Future<void> _download(
    String key,
    AudioStream stream,
    _DownloadTask task,
  ) async {
    File? tmpAudio;
    File? tmpMeta;
    IOSink? sink;
    bool stale() => _disposed || task.cancelled || task.clearGen != _clearGen;

    try {
      final uri = Uri.parse(stream.url);
      final req = await _http.getUrl(uri);
      task.request = req;
      for (final e in stream.headers.entries) {
        req.headers.set(e.key, e.value);
      }
      if (stale()) {
        req.abort();
        return;
      }
      // 弱网 / 代理卡住时请求会一直挂着，占着 _inflight，这首歌以后都不会再缓存
      final HttpClientResponse res;
      try {
        res = await req.close().timeout(idleTimeout);
      } on TimeoutException {
        req.abort();
        return;
      }
      if (stale()) {
        res.drain<void>().ignore();
        return;
      }
      if (res.statusCode != HttpStatus.ok) {
        await res.drain<void>();
        return;
      }
      final mime = res.headers.contentType?.mimeType.toLowerCase() ?? '';
      if (_isUnsupportedMime(mime)) {
        await res.drain<void>();
        return;
      }
      final expectedLen = res.contentLength;
      if (expectedLen > maxBytes) {
        await res.drain<void>();
        return;
      }

      final ext = _ext(stream, uri, mime);
      final stem = _stemPath(key);
      final audioPath = '$stem.$ext';
      final metaPath = '$stem.json';
      final audioFile = File(audioPath);
      await audioFile.parent.create(recursive: true);

      tmpAudio = File('$audioPath.${task.id}.tmp');
      sink = tmpAudio.openWrite();

      var written = 0;
      final done = Completer<void>();
      late final StreamSubscription<List<int>> sub;
      final body = res.timeout(idleTimeout);
      sub = body.listen(
        (chunk) {
          if (stale()) {
            sub.cancel().ignore();
            if (!done.isCompleted) done.complete();
            return;
          }
          written += chunk.length;
          if (written > maxBytes) {
            task.cancel();
            sub.cancel().ignore();
            if (!done.isCompleted) done.complete();
            return;
          }
          sink!.add(chunk);
        },
        onError: (Object e, StackTrace st) {
          if (!done.isCompleted) done.completeError(e, st);
        },
        onDone: () {
          if (!done.isCompleted) done.complete();
        },
        cancelOnError: true,
      );
      task.onCancel = () {
        sub.cancel().ignore();
        if (!done.isCompleted) done.complete();
      };

      await done.future;
      await sink.flush();
      await sink.close();
      sink = null;

      if (stale() || written <= 0) {
        await _deleteSafe(tmpAudio);
        return;
      }
      if (expectedLen > 0 && written != expectedLen) {
        await _deleteSafe(tmpAudio);
        return;
      }

      // 如果旧缓存存在且扩展名不同，顺手清掉旧音频文件
      final oldMetaFile = File(metaPath);
      String? oldAudioName;
      var oldSize = 0;
      if (await oldMetaFile.exists()) {
        try {
          oldSize += await oldMetaFile.length();
          final prev = jsonDecode(await oldMetaFile.readAsString());
          if (prev is Map && prev['file'] is String) {
            oldAudioName = prev['file'] as String;
            final prevAudio = File(p.join(audioFile.parent.path, oldAudioName));
            if (await prevAudio.exists()) oldSize += await prevAudio.length();
          }
        } catch (_) {}
      }

      if (stale()) {
        await _deleteSafe(tmpAudio);
        return;
      }

      await tmpAudio.rename(audioPath);
      tmpAudio = null;

      final fileName = p.basename(audioPath);
      if (oldAudioName != null &&
          oldAudioName != fileName &&
          p.basename(oldAudioName) == oldAudioName) {
        await _deleteSafe(File(p.join(audioFile.parent.path, oldAudioName)));
      }

      final metaText = jsonEncode({
        'v': version,
        'key': key,
        'at': _now().millisecondsSinceEpoch,
        'file': fileName,
        'type': stream.type.isNotEmpty ? stream.type : ext,
        'quality': stream.quality,
        'bitRate': stream.bitRate,
        'size': written,
        'peak': stream.peak,
        'gain': stream.gain,
      });
      tmpMeta = File('$metaPath.${task.id}.tmp');
      await tmpMeta.writeAsString(metaText, flush: true);
      if (stale()) {
        await _deleteSafe(tmpMeta);
        await _deleteSafe(audioFile);
        return;
      }
      await tmpMeta.rename(metaPath);
      tmpMeta = null;

      if (_bytes != null) {
        _bytes = (_bytes! - oldSize + written + utf8.encode(metaText).length)
            .clamp(0, 1 << 62);
      }
      _trimSoon();
    } catch (e) {
      if (!stale()) debugPrint('audio cache: $e');
    } finally {
      if (sink != null) {
        try {
          await sink.close();
        } catch (_) {}
      }
      if (tmpAudio != null) await _deleteSafe(tmpAudio);
      if (tmpMeta != null) await _deleteSafe(tmpMeta);
    }
  }

  static bool _isUnsupportedMime(String mime) =>
      mime == 'text/html' ||
      mime == 'text/plain' ||
      mime == 'application/json' ||
      mime == 'application/vnd.apple.mpegurl' ||
      mime == 'application/x-mpegurl' ||
      mime == 'audio/mpegurl' ||
      mime == 'application/dash+xml';

  static String _ext(AudioStream s, Uri uri, String mime) {
    String clean(String raw) {
      final v = raw.trim().toLowerCase().replaceFirst(RegExp(r'^\.'), '');
      return RegExp(r'^[a-z0-9]{1,8}$').hasMatch(v) ? v : '';
    }

    final fromType = clean(s.type);
    if (fromType.isNotEmpty) return fromType;

    final fromPath = clean(p.extension(uri.path));
    if (fromPath.isNotEmpty) return fromPath;

    return switch (mime) {
      'audio/mpeg' => 'mp3',
      'audio/flac' || 'audio/x-flac' => 'flac',
      'audio/mp4' || 'audio/x-m4a' => 'm4a',
      'audio/ogg' => 'ogg',
      'audio/wav' || 'audio/x-wav' => 'wav',
      'audio/aac' => 'aac',
      'audio/opus' => 'opus',
      'audio/webm' => 'webm',
      _ => 'audio',
    };
  }

  // ── 清理与失效 ──

  /// 删掉 [prefix] 开头的所有缓存，并取消对应正在进行的下载。
  /// [prefix] 可以是「源@」（所有账号）、「源@账号/」（整个命名空间）或更细的前缀。
  void invalidate(String prefix) {
    final matching = _inflight.keys.where((k) => k.startsWith(prefix)).toList();
    for (final k in matching) {
      cancel(k);
    }
    _deletePrefixOnDisk(prefix);
  }

  void _deletePrefixOnDisk(String prefix) {
    () async {
      final root = Directory(dir);
      if (!await root.exists()) return;
      final slash = prefix.indexOf('/');
      if (slash < 0) {
        final head = _ns('$prefix/');
        await for (final d in root.list()) {
          if (d is Directory && p.basename(d.path).startsWith(head)) {
            await d.delete(recursive: true);
          }
        }
        _bytes = null;
        return;
      }
      final d = Directory(p.join(dir, _ns(prefix)));
      if (!await d.exists()) return;
      if (slash == prefix.length - 1) {
        await d.delete(recursive: true);
        _bytes = null;
        return;
      }
      await for (final f in d.list()) {
        if (f is! File || !f.path.endsWith('.json')) continue;
        try {
          final j = jsonDecode(await f.readAsString());
          if (j is Map && '${j['key']}'.startsWith(prefix)) {
            final name = j['file'];
            final audio = name is String && p.basename(name) == name
                ? File(p.join(d.path, name))
                : null;
            await _deleteEntry(f, audio);
          }
        } catch (_) {}
      }
      _bytes = null;
    }().catchError((Object e) => debugPrint('audio cache invalidate: $e'));
  }

  /// 已经占用的字节数（扫一遍目录，不含正在写的 .tmp）。
  Future<int> size() async {
    final d = Directory(dir);
    if (!await d.exists()) return _bytes = 0;
    var n = 0;
    await for (final f in d.list(recursive: true)) {
      if (f is File && !f.path.endsWith('.tmp')) {
        try {
          n += await f.length();
        } on FileSystemException {
          // 刚被删了
        }
      }
    }
    return _bytes = n;
  }

  void _trimSoon() {
    _trimTimer?.cancel();
    _trimTimer = Timer(const Duration(seconds: 5), () => trim().ignore());
  }

  /// 先删过期（超过 [ttl]）和损坏/残留文件；仍超过上限时删最久没播过的，删到上限的九成。
  Future<void> trim() async {
    if (_disposed || _trimming) return;
    _trimming = true;
    try {
      final root = Directory(dir);
      if (!await root.exists()) {
        _bytes = 0;
        return;
      }
      final now = _now();
      // 刚写的文件（比如音频已到位、.json 还没写完）先不动。mtime 是真实时间，
      // 所以这里用真实时钟，不用 _now
      final wall = DateTime.now();
      bool fresh(DateTime modified) =>
          wall.difference(modified) < const Duration(minutes: 1);
      final live = <(File audio, File meta, DateTime used, int bytes)>[];
      final referenced = <String>{};
      final others = <File>[];

      await for (final entity in root.list(recursive: true)) {
        if (entity is! File) continue;
        final path = entity.path;
        if (path.endsWith('.tmp')) {
          try {
            final st = await entity.stat();
            if (now.difference(st.modified) > const Duration(hours: 1)) {
              await _deleteSafe(entity);
            }
          } catch (_) {}
          continue;
        }
        if (!path.endsWith('.json')) {
          others.add(entity);
          continue;
        }
        try {
          final metaStat = await entity.stat();
          final j = jsonDecode(await entity.readAsString());
          if (j is! Map || j['v'] != version) {
            await _deleteSafe(entity);
            continue;
          }
          final atMs = j['at'];
          final name = j['file'];
          if (atMs is! int ||
              name is! String ||
              name.isEmpty ||
              p.basename(name) != name) {
            await _deleteSafe(entity);
            continue;
          }
          final audio = File(p.join(entity.parent.path, name));
          final at = DateTime.fromMillisecondsSinceEpoch(atMs);
          if (now.difference(at) > ttl) {
            await _deleteEntry(entity, audio);
            continue;
          }
          if (!await audio.exists()) {
            await _deleteSafe(entity);
            continue;
          }
          final audioStat = await audio.stat();
          if (audioStat.size <= 0) {
            await _deleteEntry(entity, audio);
            continue;
          }
          referenced.add(audio.path);
          live.add((
            audio,
            entity,
            audioStat.modified,
            audioStat.size + metaStat.size,
          ));
        } catch (_) {
          await _deleteSafe(entity);
        }
      }

      // 清理没有对应 .json 的孤儿音频文件
      for (final f in others) {
        if (referenced.contains(f.path)) continue;
        try {
          if (fresh((await f.stat()).modified)) continue;
        } catch (_) {}
        await _deleteSafe(f);
      }

      var total = 0;
      for (final e in live) {
        total += e.$4;
      }
      if (total > maxBytes) {
        live.sort((a, b) => a.$3.compareTo(b.$3));
        for (final (audio, meta, used, sz) in live) {
          if (total <= maxBytes * 0.9) break;
          if (fresh(used)) continue;
          await _deleteEntry(meta, audio);
          total -= sz;
        }
      }
      _bytes = total.clamp(0, 1 << 62);
    } catch (e) {
      debugPrint('audio cache trim: $e');
    } finally {
      _trimming = false;
    }
  }

  /// 清空全部音频缓存。
  Future<void> clear() async {
    _clearGen++;
    cancelAll();
    try {
      final d = Directory(dir);
      if (await d.exists()) await d.delete(recursive: true);
    } on FileSystemException catch (e) {
      debugPrint('audio cache clear: $e');
    }
    _bytes = 0;
  }

  void dispose() {
    _disposed = true;
    _trimTimer?.cancel();
    cancelAll();
    _http.close(force: true);
  }

  // ── 路径与工具 ──

  static String _ns(String key) {
    final i = key.indexOf('/');
    final ns = i < 0 ? '_' : key.substring(0, i);
    return ns.replaceAll(RegExp(r'[^\w@.\-]'), '_');
  }

  String _stemPath(String key) => p.join(
    dir,
    _ns(key),
    sha1.convert(utf8.encode(key)).toString().substring(0, 24),
  );

  String _metaPath(String key) => '${_stemPath(key)}.json';

  Future<void> _deleteEntry(File meta, File? audio) async {
    await _deleteSafe(meta);
    if (audio != null) await _deleteSafe(audio);
  }

  Future<void> _deleteSafe(File f) async {
    try {
      if (await f.exists()) await f.delete();
    } on FileSystemException {
      // 正在写或已删除，下次再说
    }
  }
}

class _DownloadTask {
  _DownloadTask(this.id, this.clearGen);

  final int id;
  final int clearGen;
  bool cancelled = false;
  HttpClientRequest? request;
  VoidCallback? onCancel;
  late Future<void> done;

  void cancel() {
    if (cancelled) return;
    cancelled = true;
    try {
      request?.abort();
    } catch (_) {}
    onCancel?.call();
  }
}
