import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

/// Songs with no matching source: _sync fails right away when fetching the URL, without creating a playback engine.
Track _t(String id) => Track.of(
  m.Track(id: id, name: 'Song $id', source: 'nosrc', duration: 180000),
);

List<String> _ids(AppState a) => [for (final t in a.queue) t.ref!.id];

/// Waits for _sync to fail fetching the URL and drop the song (otherwise selecting the same song again would touch the real playback engine).
Future<void> _settle() =>
    Future<void>.delayed(const Duration(milliseconds: 350));

class _DislikeSource extends Source {
  @override
  final info = const m.SourceInfo(id: 'nosrc', name: 'Station source');

  @override
  final ops = {Op.dislike};

  final disliked = <(String, String)>[];

  @override
  Future<void> dislike(String id, {String station = ''}) async {
    disliked.add((id, station));
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  setUp(() {
    app = AppState();
    app.clearQueue();
    if (app.shuffle) app.toggleShuffle();
  });
  tearDown(() async {
    await _settle(); // wait for the pending _sync to finish, then dispose
    app.dispose();
  });

  final ids = [for (var i = 0; i < 8; i++) '$i'];

  test('playList 从指定位置开始，越界时夹紧', () {
    app.playList([for (final i in ids) _t(i)], start: 3);
    expect(app.index, 3);
    expect(app.track.ref!.id, '3');
    app.playList([for (final i in ids) _t(i)], start: 99);
    expect(app.index, 7);
  });

  test('随机播放整张：打开随机，从第一个位置放，每首都在；关掉回到原顺序', () {
    app.playList([for (final i in ids) _t(i)], shuffled: true);
    expect(app.shuffle, isTrue);
    expect(app.index, 0);
    expect(_ids(app).toSet(), ids.toSet());
    final first = app.track.ref!.id;
    app.toggleShuffle();
    expect(_ids(app), ids);
    expect(app.track.ref!.id, first);
  });

  test('按顺序播放：关掉随机模式', () {
    app.toggleShuffle();
    app.playList([for (final i in ids) _t(i)], shuffled: false);
    expect(app.shuffle, isFalse);
    expect(_ids(app), ids);
  });

  test('next / prev / repeat', () async {
    app.playList([for (final i in ids.take(3)) _t(i)]);
    await _settle();
    if (!app.repeat) app.toggleRepeat();
    app.next();
    app.next();
    expect(app.index, 2);
    app.next(); // repeat wraps back to the first song
    expect(app.index, 0);
    await _settle();
    app.toggleRepeat(); // turn repeat off
    app.playQueueAt(2);
    await _settle();
    app.next();
    expect(app.index, 2);
    expect(app.playing, isFalse);
    app.prev();
    expect(app.index, 1);
    await _settle();
    app.position = 10;
    // Played over 3 seconds: back to the start, not the previous song
    app.prev();
    expect(app.index, 1);
    expect(app.position, 0);
  });

  test('removeQueueAt 维持当前歌曲', () {
    app.playList([for (final i in ids.take(5)) _t(i)], start: 2);
    app.removeQueueAt(0);
    expect(app.track.ref!.id, '2');
    app.removeQueueAt(3); // remove one after the current
    expect(app.track.ref!.id, '2');
    expect(_ids(app), ['1', '2', '3']);
    app.removeQueueAt(1); // remove the current one: continue with the next
    expect(app.track.ref!.id, '3');
    app.removeQueueAt(-1);
    app.removeQueueAt(99);
    expect(app.queue, hasLength(2));
  });

  test('删掉最后一首当前歌：落到新的最后一首', () {
    app.playList([for (final i in ids.take(3)) _t(i)], start: 2);
    app.removeQueueAt(2);
    expect(app.index, 1);
    expect(app.track.ref!.id, '1');
  });

  test('只剩一首时删除等于清空', () {
    app.playList([_t('a')]);
    app.removeQueueAt(0);
    expect(app.queue, isEmpty);
    expect(app.playing, isFalse);
    expect(app.track, same(Track.none));
  });

  test('打开随机：当前这首不动，后面的打乱，歌不多不少', () {
    app.playList([for (final i in ids) _t(i)], start: 2);
    app.toggleShuffle();
    expect(app.track.ref!.id, '2');
    expect(_ids(app).take(3), ['0', '1', '2']);
    expect(_ids(app).toSet(), ids.toSet());
  });

  test('关掉随机：恢复原顺序，随机期间加的歌接在后面', () {
    app.playList([for (final i in ids) _t(i)], start: 2);
    app.toggleShuffle();
    app.addToQueue(_t('x'));
    app.next();
    final cur = app.track.ref!.id;
    app.toggleShuffle();
    expect(_ids(app), [...ids, 'x']);
    expect(app.track.ref!.id, cur);
  });

  test(
    'turning shuffle off after relaunch restores the original queue',
    () async {
      app.playList([for (final i in ids) _t(i), _t('2')], start: 2);
      final original = _ids(app);
      for (var attempt = 0; attempt < 10; attempt++) {
        app.toggleShuffle();
        if (!listEquals(_ids(app), original)) break;
        app.toggleShuffle();
      }
      expect(app.shuffle, isTrue);
      expect(_ids(app), isNot(original));
      final remaining = [...original]..remove('1');
      app.removeQueueAt(1);
      app.addNext(_t('x'));
      final shuffled = _ids(app);
      await _settle();
      app.dispose();
      app = AppState();

      expect(app.shuffle, isTrue);
      expect(_ids(app), shuffled);
      final current = app.track;
      app.toggleShuffle();
      expect(_ids(app), [...remaining, 'x']);
      expect(app.index, 1);
      expect(app.track, same(current));
    },
  );

  test('随机期间删掉的歌，关掉随机后不会回来', () {
    app.playList([for (final i in ids) _t(i)], start: 0);
    app.toggleShuffle();
    final victim = _ids(app)[3];
    app.removeQueueAt(3);
    app.toggleShuffle();
    expect(_ids(app), isNot(contains(victim)));
    expect(_ids(app), hasLength(7));
    expect(app.track.ref!.id, '0');
  });

  test(
    'Play Next keeps a queued copy in added order across relaunch',
    () async {
      app.playList([_t('a'), _t('b'), _t('c')]);
      app.toggleShuffle();
      final upcoming = app.queue.last;
      app.addNext(_t('x'));
      app.addNext(upcoming);
      await _settle();
      app.dispose();
      app = AppState();

      app.toggleShuffle();
      expect(_ids(app), ['a', 'b', 'c', upcoming.ref!.id, 'x']);
    },
  );

  test(
    'adding an existing queued track after relaunch keeps both copies',
    () async {
      app.playList([_t('a'), _t('b'), _t('c')]);
      app.toggleShuffle();
      await _settle();
      app.dispose();
      app = AppState();
      final upcoming = app.queue.last;

      app.addNext(upcoming);
      app.addToQueue(upcoming);
      app.toggleShuffle();
      expect(_ids(app), ['a', 'b', 'c', upcoming.ref!.id, upcoming.ref!.id]);
    },
  );

  test('a saved shuffled queue without original order keeps its order', () {
    app.dispose();
    final saved = File('${AppState.supportDir()}/player.json');
    saved.parent.createSync(recursive: true);
    saved.writeAsStringSync(
      jsonEncode({
        'tracks': [
          for (final id in ['2', '0', '1']) _t(id).ref!.toJson(),
        ],
        'index': 1,
        'shuffle': true,
      }),
    );
    app = AppState();

    expect(app.shuffle, isTrue);
    app.toggleShuffle();
    expect(app.shuffle, isFalse);
    expect(_ids(app), ['2', '0', '1']);
    expect(app.index, 1);
  });

  for (final relaunch in [false, true]) {
    test(
      'Shuffle off does not bring back disliked songs (relaunch: $relaunch)',
      () async {
        const original = ['a', 'b', 'c', 'd'];
        app.playList([
          for (final i in original) _t(i),
        ], from: 'station:nosrc/radio');
        app.toggleShuffle();
        await _settle();
        if (relaunch) {
          app.dispose();
          app = AppState();
        }
        final source = _DislikeSource();
        app.sources.add(source);

        final upcoming = app.queue.last;
        final current = app.track;
        await app.dislike(upcoming);
        await app.dislike(current);
        final dislikedIds = {upcoming.ref!.id, current.ref!.id};
        expect(source.disliked, [
          (upcoming.ref!.id, 'radio'),
          (current.ref!.id, 'radio'),
        ]);
        expect(_ids(app), isNot(anyElement(dislikedIds.contains)));
        final next = app.track;
        app.toggleShuffle();
        expect(_ids(app), [
          for (final id in original)
            if (!dislikedIds.contains(id)) id,
        ]);
        expect(app.track, same(next));
      },
    );
  }

  test('playTrack：队列里有就跳过去，没有就插在当前之后', () async {
    app.playList([for (final i in ids.take(3)) _t(i)]);
    app.playTrack(_t('2'));
    expect(app.index, 2);
    await _settle();
    app.playQueueAt(0);
    app.playTrack(_t('new'));
    expect(_ids(app), ['0', 'new', '1', '2']);
    expect(app.index, 1);
  });

  test('addNext 插到当前之后，空队列时直接加', () {
    app.addNext(_t('a'));
    expect(_ids(app), ['a']);
    app.playList([for (final i in ids.take(3)) _t(i)]);
    app.addNext(_t('n'));
    expect(_ids(app), ['0', 'n', '1', '2']);
  });

  test('upNext / nextTrack', () {
    app.playList([for (final i in ids.take(3)) _t(i)], start: 1);
    expect([for (final t in app.upNext) t.ref!.id], ['2']);
    app.playQueueAt(2);
    if (!app.repeat) app.toggleRepeat();
    expect(app.nextTrack!.ref!.id, '0');
    app.toggleRepeat();
    expect(app.nextTrack, isNull);
  });
}
