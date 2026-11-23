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

  // Fetched data goes to memory and disk; after a "restart" it's read back from disk, and the model is decoded only once.
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

    // Entries not stored on disk are gone after a restart
    await s.fetch('a@1/y', memOnly, () async => 1);
    await s.flush();
    s.dropMemory();
    expect(s.peek('a@1/y', memOnly), isNull);
  });

  // No refetch within fresh; past fresh, serve the old one and refetch in the background; past maxAge, treat as missing.
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

  // Only one request per key at a time.
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

  // Invalidated mid-fetch: the result isn't cached; other keys are unaffected.
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
    // Fetching again sends a new request
    expect(await s.fetch('b@1/y', pol, () async => 3), 3);
  });

  // invalidate also deletes from disk: a whole namespace, all accounts, or a prefix.
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

  // Optimistic update: readable right after the change, put back on error; the time stays.
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

  // After a failure, wait before retrying; the old data still works.
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

  // Over the cap, the least recently used are deleted.
  test('trim to max bytes', () async {
    final s = store(max: 3000);
    final big = 'x' * 900;
    for (var i = 0; i < 6; i++) {
      await s.fetch('a@1/$i', pol, () async => big);
      await s.flush();
      // Stagger file times: the earlier written, the older
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
    // Over 1 MB isn't read synchronously
    expect(b.peek('src@a/library/tracks', pol), isNull);
    final e = await b.read('src@a/library/tracks', pol);
    expect((e!.data as List).length, 60000);
  });

  // invalidate before the disk write finishes: the delete must queue behind the write so old data doesn't come back after a restart.
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

  // After deleting files the tally is too high: trim must check actual usage and not delete caches still under the cap.
  test(
    'trim after invalidate does not evict entries under the limit',
    () async {
      final big = 'x' * 4000;
      final s = store(max: 20000);
      await s.size(); // let the store start keeping count
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
