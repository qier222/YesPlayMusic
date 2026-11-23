import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/cache/audio_cache.dart';
import 'package:yesplaymusic/music/models.dart';

void main() {
  late Directory tmp;
  late DateTime now;
  late HttpServer server;
  late String baseUrl;
  late int hits;
  late Map<String, String> lastHeaders;
  late Uint8List payload;
  late String contentType;
  late int statusCode;
  Completer<void>? holdResponse;

  AudioDiskCache makeCache({
    int maxBytes = 1 << 30,
    Duration ttl = const Duration(days: 30),
    Duration idleTimeout = const Duration(seconds: 60),
  }) => AudioDiskCache(
    dir: tmp.path,
    maxBytes: maxBytes,
    ttl: ttl,
    idleTimeout: idleTimeout,
    now: () => now,
    http: HttpClient(),
  );

  setUp(() async {
    tmp = Directory.systemTemp.createTempSync('ypm_audio_cache_');
    now = DateTime(2026, 11, 22, 12);
    hits = 0;
    lastHeaders = {};
    payload = Uint8List.fromList(List.generate(4096, (i) => i % 251));
    contentType = 'audio/mpeg';
    statusCode = HttpStatus.ok;
    holdResponse = null;

    server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    baseUrl = 'http://127.0.0.1:${server.port}';
    server.listen((req) async {
      hits++;
      lastHeaders = {};
      req.headers.forEach((k, v) => lastHeaders[k.toLowerCase()] = v.join(','));
      if (holdResponse != null) {
        await holdResponse!.future;
      }
      req.response.statusCode = statusCode;
      req.response.headers.set(HttpHeaders.contentTypeHeader, contentType);
      if (statusCode == HttpStatus.ok) {
        req.response.contentLength = payload.length;
        req.response.add(payload);
      }
      await req.response.close();
    });
  });

  tearDown(() async {
    await server.close(force: true);
    if (tmp.existsSync()) tmp.deleteSync(recursive: true);
  });

  test('isCacheable accepts http(s) audio and rejects local/HLS/DASH', () {
    expect(
      AudioDiskCache.isCacheable(
        const AudioStream(url: 'https://cdn.example.com/1.mp3', type: 'mp3'),
      ),
      isTrue,
    );
    expect(
      AudioDiskCache.isCacheable(
        const AudioStream(url: 'file:///tmp/a.flac', type: 'flac'),
      ),
      isFalse,
    );
    expect(
      AudioDiskCache.isCacheable(
        const AudioStream(url: 'https://cdn.example.com/a.m3u8', type: 'hls'),
      ),
      isFalse,
    );
    expect(
      AudioDiskCache.isCacheable(
        const AudioStream(url: 'https://cdn.example.com/a.mpd', type: ''),
      ),
      isFalse,
    );
  });

  test('caches stream to disk and serves directly after restart', () async {
    final c1 = makeCache();
    addTearDown(c1.dispose);

    expect(await c1.get('demo@u1/song1'), isNull);

    final remote = AudioStream(
      url: '$baseUrl/song1.mp3',
      type: 'mp3',
      quality: 'high',
      bitRate: 320000,
      size: payload.length,
      peak: 0.95,
      gain: -2.5,
      headers: const {'Referer': 'https://music.example.com', 'X-Token': 'abc'},
    );
    await c1.cache('demo@u1/song1', remote);
    expect(hits, 1);
    expect(lastHeaders['referer'], 'https://music.example.com');
    expect(lastHeaders['x-token'], 'abc');

    // 模拟重启：新建实例从磁盘读取，不再发网络请求
    final c2 = makeCache();
    addTearDown(c2.dispose);
    final cached = await c2.get('demo@u1/song1');
    expect(cached, isNotNull);
    expect(cached!.url, startsWith('file://'));
    expect(cached.url, endsWith('.mp3'));
    expect(cached.type, 'mp3');
    expect(cached.quality, 'high');
    expect(cached.bitRate, 320000);
    expect(cached.size, payload.length);
    expect(cached.peak, 0.95);
    expect(cached.gain, -2.5);
    expect(cached.headers, isEmpty);
    expect(File(Uri.parse(cached.url).toFilePath()).readAsBytesSync(), payload);
    expect(hits, 1);
  });

  test('expires after 30 days and deletes stale files', () async {
    final c = makeCache();
    addTearDown(c.dispose);

    await c.cache(
      'demo@u1/s1',
      AudioStream(url: '$baseUrl/s1.flac', type: 'flac'),
    );

    // 29 天内仍然有效
    now = now.add(const Duration(days: 29));
    final before = await c.get('demo@u1/s1');
    expect(before, isNotNull);
    final filePath = Uri.parse(before!.url).toFilePath();

    // 再过 2 天（总共 31 天，超过一个月）：失效且删除文件
    now = now.add(const Duration(days: 2));
    expect(await c.get('demo@u1/s1'), isNull);
    expect(File(filePath).existsSync(), isFalse);
    expect(await c.size(), 0);
  });

  test('dedupes concurrent downloads for the same key', () async {
    final c = makeCache();
    addTearDown(c.dispose);

    holdResponse = Completer<void>();
    final s = AudioStream(url: '$baseUrl/dup.mp3', type: 'mp3');
    final f1 = c.cache('src@a/dup', s);
    final f2 = c.cache('src@a/dup', s);
    holdResponse!.complete();
    await Future.wait([f1, f2]);
    expect(hits, 1);
    expect(await c.get('src@a/dup'), isNotNull);
  });

  test('skips caching on HTTP error or HTML response', () async {
    final c = makeCache();
    addTearDown(c.dispose);

    statusCode = HttpStatus.forbidden;
    await c.cache(
      'src@a/err',
      AudioStream(url: '$baseUrl/err.mp3', type: 'mp3'),
    );
    expect(await c.get('src@a/err'), isNull);

    statusCode = HttpStatus.ok;
    contentType = 'text/html; charset=utf-8';
    await c.cache(
      'src@a/html',
      AudioStream(url: '$baseUrl/html.mp3', type: 'mp3'),
    );
    expect(await c.get('src@a/html'), isNull);
    expect(await c.size(), 0);
  });

  test(
    'trim removes expired entries first and then LRU by lastModified',
    () async {
      // 每条大约 4096 字节 + ~180 字节 meta ≈ 4280 字节，上限设 10000 字节
      final c = makeCache(maxBytes: 10000);
      addTearDown(c.dispose);

      for (var i = 0; i < 4; i++) {
        await c.cache(
          'src@a/$i',
          AudioStream(url: '$baseUrl/$i.mp3', type: 'mp3'),
        );
        final got = await c.get('src@a/$i');
        File(Uri.parse(got!.url).toFilePath())
            .setLastModifiedSync(DateTime(2026, 1, 1, 0, i));
      }

      await c.trim();
      expect(await c.size(), lessThanOrEqualTo(10000));
      expect(await c.get('src@a/0'), isNull);
      expect(await c.get('src@a/3'), isNotNull);

      // 超过一个月后 trim 会清空全部过期条目
      now = now.add(const Duration(days: 31));
      await c.trim();
      expect(await c.size(), 0);
    },
  );

  // 音频先到位、.json 后写：刚写的「孤儿」文件不删，放久了才删。
  test('trim keeps fresh orphan audio, deletes old ones', () async {
    final c = makeCache();
    addTearDown(c.dispose);
    final sub = Directory('${tmp.path}/ab')..createSync();
    final orphan = File('${sub.path}/new.mp3')..writeAsBytesSync([1, 2, 3]);

    await c.trim();
    expect(orphan.existsSync(), isTrue);

    orphan.setLastModifiedSync(
      DateTime.now().subtract(const Duration(minutes: 2)),
    );
    await c.trim();
    expect(orphan.existsSync(), isFalse);
  });

  // 刚写的歌即使最久没播过，超上限时也先不删。
  test('trim does not evict files written in the last minute', () async {
    // 每首约 4280 字节：删掉旧的那首还超，不跳过的话会接着删刚写的
    final c = makeCache(maxBytes: 5000);
    addTearDown(c.dispose);
    await c.cache('src@a/old', AudioStream(url: '$baseUrl/o.mp3', type: 'mp3'));
    final old = await c.get('src@a/old');
    File(Uri.parse(old!.url).toFilePath())
        .setLastModifiedSync(DateTime(2026, 1, 1));
    for (final k in ['new1', 'new2']) {
      await c.cache(
        'src@a/$k',
        AudioStream(url: '$baseUrl/$k.mp3', type: 'mp3'),
      );
    }
    await c.trim();
    expect(await c.get('src@a/old'), isNull);
    expect(await c.get('src@a/new1'), isNotNull);
    expect(await c.get('src@a/new2'), isNotNull);
  });

  test(
    'invalidate removes matching namespace and clear wipes everything',
    () async {
      final c = makeCache();
      addTearDown(c.dispose);

      for (final k in ['a@1/1', 'a@2/1', 'b@1/1']) {
        await c.cache(k, AudioStream(url: '$baseUrl/x.mp3', type: 'mp3'));
      }

      c.invalidate('a@');
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(await c.get('a@1/1'), isNull);
      expect(await c.get('a@2/1'), isNull);
      expect(await c.get('b@1/1'), isNotNull);

      await c.clear();
      expect(await c.get('b@1/1'), isNull);
      expect(await c.size(), 0);
    },
  );

  // 服务器一直不回（弱网、代理卡住）：超时放弃，不留半截文件，下次还能重新缓存。
  test('gives up on a stalled server and can retry', () async {
    final c = makeCache(idleTimeout: const Duration(milliseconds: 200));
    addTearDown(c.dispose);
    final remote = AudioStream(url: '$baseUrl/stall.mp3', type: 'mp3');
    holdResponse = Completer<void>();
    await c.cache('k', remote).timeout(const Duration(seconds: 5));
    expect(await c.get('k'), isNull);
    holdResponse!.complete();
    holdResponse = null;
    await c.cache('k', remote);
    expect(await c.get('k'), isNotNull);
    expect(hits, 2);
  });
}
