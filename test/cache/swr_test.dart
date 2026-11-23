import 'dart:async';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/cache/swr.dart';

void main() {
  late Directory tmp;
  late DateTime now;
  SwrStore store({int max = 200 << 20}) =>
      SwrStore(dir: tmp.path, maxBytes: max, now: () => now);
  const pol = CachePolicy(
    fresh: Duration(minutes: 5),
    maxAge: Duration(days: 1),
  );
  const memOnly = CachePolicy(
    fresh: Duration(minutes: 5),
    maxAge: Duration(days: 1),
    persist: false,
  );

  setUp(() {
    tmp = Directory.systemTemp.createTempSync('ypm_swr_');
    now = DateTime(2026, 11, 22, 12);
  });
  tearDown(() {
    if (tmp.existsSync()) tmp.deleteSync(recursive: true);
  });

  // 取到的存进内存和磁盘；「重启」后从磁盘读回来，转好的模型只转一次。
  test('fetch, persist, read back after restart', () async {
    final s = store();
    expect(s.peek('a@1/x', pol), isNull);
    await s.fetch('a@1/x', pol, () async => {'n': 1});
    await s.flush();
    s.dropMemory();
    final e = s.peek('a@1/x', pol)!;
    expect(e.data, {'n': 1});
    var calls = 0;
    int dec(Object? raw) {
      calls++;
      return (raw as Map)['n'] as int;
    }

    expect(e.value(dec), 1);
    expect(e.value(dec), 1);
    expect(calls, 1);

    // 不存盘的重启后没有
    await s.fetch('a@1/y', memOnly, () async => 1);
    await s.flush();
    s.dropMemory();
    expect(s.peek('a@1/y', memOnly), isNull);
  });

  // fresh 内不重取；过了 fresh 先给旧的、后台重取；过了 maxAge 当作没有。
  test('freshness', () async {
    final s = store();
    var n = 0;
    Future<Object?> load() async => ++n;
    await s.fetch('a@1/x', pol, load);
    expect(s.revalidate('a@1/x', pol, load), isFalse);
    now = now.add(const Duration(minutes: 6));
    expect(s.peek('a@1/x', pol)!.data, 1);
    expect(s.revalidate('a@1/x', pol, load), isTrue);
    await Future<void>.delayed(Duration.zero);
    await Future<void>.delayed(Duration.zero);
    expect(s.peek('a@1/x', pol)!.data, 2);
    now = now.add(const Duration(days: 2));
    expect(s.peek('a@1/x', pol), isNull);
  });

  // 同一个 key 同时只发一个请求。
  test('dedupe', () async {
    final s = store();
    final c = Completer<Object?>();
    var calls = 0;
    Future<Object?> load() {
      calls++;
      return c.future;
    }

    final a = s.fetch('a@1/x', pol, load);
    final b = s.fetch('a@1/x', pol, load);
    expect(s.revalidate('a@1/x', pol, load), isTrue);
    c.complete(7);
    expect(await a, 7);
    expect(await b, 7);
    expect(calls, 1);
  });

  // 取的途中被 invalidate：结果不进缓存；别的 key 不受影响。
  test('invalidate drops in-flight results only for its prefix', () async {
    final s = store();
    final c1 = Completer<Object?>(), c2 = Completer<Object?>();
    final f1 = s.fetch('a@1/x', pol, () => c1.future);
    final f2 = s.fetch('b@1/x', pol, () => c2.future);
    s.invalidate('a@1/');
    c1.complete(1);
    c2.complete(2);
    await f1;
    await f2;
    expect(s.peek('a@1/x', pol), isNull);
    expect(s.peek('b@1/x', pol)!.data, 2);
    // 再取会发新的请求
    expect(await s.fetch('b@1/y', pol, () async => 3), 3);
  });

  // invalidate 也删磁盘：整个命名空间、所有账号、某个前缀。
  test('invalidate on disk', () async {
    final s = store();
    for (final k in ['a@1/p/1', 'a@1/p/2', 'a@1/q', 'a@2/q', 'b@1/q']) {
      await s.fetch(k, pol, () async => k);
    }
    await s.flush();
    s.invalidate('a@1/p/');
    await Future<void>.delayed(const Duration(milliseconds: 50));
    s.dropMemory();
    expect(s.peek('a@1/p/1', pol), isNull);
    expect(s.peek('a@1/q', pol), isNotNull);
    s.invalidate('a@');
    await Future<void>.delayed(const Duration(milliseconds: 50));
    s.dropMemory();
    expect(s.peek('a@1/q', pol), isNull);
    expect(s.peek('a@2/q', pol), isNull);
    expect(s.peek('b@1/q', pol), isNotNull);
  });

  // 乐观更新：改了马上能读到，出错放回去；时间不变。
  test('mutate and restore', () async {
    final s = store();
    await s.fetch('a@1/x', pol, () async => {'liked': false});
    final keys = <String>[];
    s.changes.listen(keys.add);
    final old = s.mutate('a@1/x', pol, (r) => {...(r as Map), 'liked': true});
    expect(s.peek('a@1/x', pol)!.data, {'liked': true});
    s.restore('a@1/x', pol, old);
    expect(s.peek('a@1/x', pol)!.data, {'liked': false});
    expect(keys, ['a@1/x', 'a@1/x']);
    expect(s.mutate('a@1/none', pol, (r) => r), isNull);
  });

  // 失败后等一会儿再试；旧的照样能用。
  test('backoff after failure', () async {
    final s = store();
    await s.fetch('a@1/x', pol, () async => 1);
    now = now.add(const Duration(minutes: 6));
    Future<Object?> bad() async => throw Exception('x');
    await expectLater(s.fetch('a@1/x', pol, bad), throwsException);
    expect(s.peek('a@1/x', pol)!.data, 1);
    expect(s.revalidate('a@1/x', pol, bad), isFalse);
    now = now.add(const Duration(seconds: 6));
    expect(s.revalidate('a@1/x', pol, () async => 2), isTrue);
  });

  // 超过上限时删最久没用过的。
  test('trim to max bytes', () async {
    final s = store(max: 3000);
    final big = 'x' * 900;
    for (var i = 0; i < 6; i++) {
      await s.fetch('a@1/$i', pol, () async => big);
      await s.flush();
      // 文件时间错开：越早写的越旧
      final f = tmp
          .listSync(recursive: true)
          .whereType<File>()
          .firstWhere((f) => f.readAsStringSync().contains('"a@1/$i"'));
      f.setLastModifiedSync(DateTime(2026, 1, 1, 0, i));
    }
    await s.size();
    await s.trim();
    expect(await s.size(), lessThanOrEqualTo(3000));
    s.dropMemory();
    expect(s.peek('a@1/0', pol), isNull);
    expect(s.peek('a@1/5', pol), isNotNull);
  });

  test('read loads large entries from disk', () async {
    final dir = Directory.systemTemp.createTempSync('swr_big');
    addTearDown(() => dir.deleteSync(recursive: true));
    const pol = CachePolicy(fresh: Duration.zero, maxAge: Duration(days: 1));
    final big = List.generate(60000, (i) => 'track-$i-xxxxxxxxxx');
    final a = SwrStore(dir: dir.path)..put('src@a/library/tracks', pol, big);
    await a.flush();
    final b = SwrStore(dir: dir.path);
    expect(b.peek('src@a/library/tracks', pol), isNull); // 超过 1 MB 不同步读
    final e = await b.read('src@a/library/tracks', pol);
    expect((e!.data as List).length, 60000);
  });

  // 写盘还没完成就 invalidate：删除要排在写入之后，不能让旧数据在重启后复活。
  test('invalidate right after put does not resurrect on disk', () async {
    final s = store();
    s.put('a@1/x', pol, {'n': 1});
    s.invalidate('a@1/x');
    await s.flush();
    await Future<void>.delayed(const Duration(milliseconds: 100));
    s.dropMemory();
    expect(s.peek('a@1/x', pol), isNull);
    expect(await s.read('a@1/x', pol), isNull);
  });

  test('invalidate namespace right after put does not resurrect', () async {
    final s = store();
    s.put('a@1/x', pol, {'n': 1});
    s.put('a@1/y', pol, {'n': 2});
    s.invalidate('a@1/');
    await s.flush();
    await Future<void>.delayed(const Duration(milliseconds: 100));
    s.dropMemory();
    expect(s.peek('a@1/x', pol), isNull);
    expect(s.peek('a@1/y', pol), isNull);
  });

  test('clear right after put does not resurrect', () async {
    final s = store();
    s.put('a@1/x', pol, {'n': 1});
    await s.clear();
    await s.flush();
    s.dropMemory();
    expect(s.peek('a@1/x', pol), isNull);
  });

  // 删过文件后计数偏大：trim 要按实际占用判断，不能误删还在上限内的缓存。
  test(
    'trim after invalidate does not evict entries under the limit',
    () async {
      final big = 'x' * 4000;
      final s = store(max: 20000);
      await s.size(); // 让 store 开始记账
      for (var i = 0; i < 4; i++) {
        s.put('a@1/k$i', pol, big);
      }
      await s.flush();
      for (var i = 0; i < 4; i++) {
        s.invalidate('a@1/k$i');
      }
      await Future<void>.delayed(const Duration(milliseconds: 100));
      for (var i = 0; i < 3; i++) {
        s.put('b@1/k$i', pol, big);
      }
      await s.flush();
      await s.trim();
      s.dropMemory();
      for (var i = 0; i < 3; i++) {
        expect(s.peek('b@1/k$i', pol), isNotNull, reason: 'b@1/k$i');
      }
    },
  );
}
