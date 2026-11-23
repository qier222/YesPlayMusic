import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/cache/image_cache.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = null;

  late Directory tmp;
  late HttpServer server;
  var served = <String, List<int>>{};
  var hits = 0;

  setUp(() async {
    tmp = await Directory.systemTemp.createTemp('ypm_img_');
    ImageDiskCache.instance.dir = tmp.path;
    hits = 0;
    served = {};
    server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    server.listen((req) async {
      hits++;
      final body = served[req.uri.path];
      if (body == null) {
        req.response.statusCode = 404;
      } else {
        req.response.add(body);
      }
      await req.response.close();
    });
  });

  tearDown(() async {
    await server.close(force: true);
    ImageDiskCache.instance.dir = null;
    if (tmp.existsSync()) tmp.deleteSync(recursive: true);
  });

  String url(String path) => 'http://127.0.0.1:${server.port}$path';

  Future<void> settle() =>
      Future<void>.delayed(const Duration(milliseconds: 100));

  int files() => tmp
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.img'))
      .length;

  test('下载一次存盘，再取直接读盘', () async {
    served['/a.png'] = [1, 2, 3];
    final c = ImageDiskCache.instance;
    expect(await c.bytes(url('/a.png')), [1, 2, 3]);
    await settle();
    expect(files(), 1);
    expect(await c.bytes(url('/a.png')), [1, 2, 3]);
    expect(hits, 1);
  });

  test('带中文的地址不和别的地址撞文件名', () async {
    // "中" is U+4E2D; truncated to one byte from UTF-16 it becomes 0x2D "-"
    served['/a%E4%B8%AD.png'] = [1];
    served['/a-.png'] = [2];
    final c = ImageDiskCache.instance;
    expect(await c.bytes(url('/a中.png')), [1]);
    await settle();
    expect(await c.bytes(url('/a-.png')), [2]);
    await settle();
    expect(files(), 2);
    expect(await c.bytes(url('/a中.png')), [1]);
  });

  test('同一张图同时只下载一次', () async {
    served['/b.png'] = [9];
    final c = ImageDiskCache.instance;
    final r = await Future.wait([
      c.bytes(url('/b.png')),
      c.bytes(url('/b.png')),
      c.bytes(url('/b.png')),
    ]);
    expect(r.every((b) => b.length == 1), isTrue);
    expect(hits, 1);
  });

  test('HTTP 错误抛出且不存盘', () async {
    final c = ImageDiskCache.instance;
    await expectLater(
      c.bytes(url('/missing.png')),
      throwsA(isA<HttpException>()),
    );
    await settle();
    expect(files(), 0);
  });

  test('evict 删掉磁盘上的那份，下次重新下载', () async {
    served['/c.png'] = [4, 5];
    final c = ImageDiskCache.instance;
    await c.bytes(url('/c.png'));
    await c.evict(url('/c.png'));
    expect(files(), 0);
    await c.bytes(url('/c.png'));
    expect(hits, 2);
  });

  test('解码失败时删掉磁盘上的坏数据', () async {
    served['/bad.png'] = '<html>captive portal</html>'.codeUnits;
    final img = DiskCachedImage(url('/bad.png'));
    Future<ui.Codec> decode(
      ui.ImmutableBuffer buffer, {
      ui.TargetImageSizeCallback? getTargetSize,
    }) async => throw Exception('not an image');
    final completer = img.loadImage(img, decode);
    final errored = Completer<void>();
    completer.addListener(
      ImageStreamListener(
        (_, _) {},
        onError: (_, _) {
          if (!errored.isCompleted) errored.complete();
        },
      ),
    );
    await errored.future.timeout(const Duration(seconds: 5));
    await settle();
    expect(files(), 0);
  });

  test('trim 超过上限时删最旧的', () async {
    final c = ImageDiskCache.instance;
    final old = c.maxBytes;
    c.maxBytes = 2500;
    try {
      for (var i = 0; i < 4; i++) {
        served['/t$i.png'] = Uint8List(1000);
        await c.bytes(url('/t$i.png'));
        await settle();
      }
      await c.size();
      await c.trim();
      expect(await c.size(), lessThanOrEqualTo(2500));
    } finally {
      c.maxBytes = old;
    }
  });
}
