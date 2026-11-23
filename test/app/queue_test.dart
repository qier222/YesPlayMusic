import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/state.dart';

/// 没有对应源的歌：_sync 取地址时直接失败，不会创建播放引擎。
Track _t(String id) => Track.of(
  m.Track(id: id, name: 'Song $id', source: 'nosrc', duration: 180000),
);

List<String> _ids(AppState a) => [for (final t in a.queue) t.ref!.id];

/// 等 _sync 取地址失败、放下这首（否则下一次选中同一首会去碰真正的播放引擎）。
Future<void> _settle() =>
    Future<void>.delayed(const Duration(milliseconds: 350));

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  setUp(() {
    app = AppState();
    app.clearQueue();
    if (app.shuffle) app.toggleShuffle();
  });
  tearDown(() async {
    await _settle(); // 等挂着的 _sync 结束，再 dispose
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
    app.next(); // 循环回到第一首
    expect(app.index, 0);
    await _settle();
    app.toggleRepeat(); // 关掉循环
    app.playQueueAt(2);
    await _settle();
    app.next();
    expect(app.index, 2);
    expect(app.playing, isFalse);
    app.prev();
    expect(app.index, 1);
    await _settle();
    app.position = 10;
    app.prev(); // 放了 3 秒以上：回到开头而不是上一首
    expect(app.index, 1);
    expect(app.position, 0);
  });

  test('removeQueueAt 维持当前歌曲', () {
    app.playList([for (final i in ids.take(5)) _t(i)], start: 2);
    app.removeQueueAt(0);
    expect(app.track.ref!.id, '2');
    app.removeQueueAt(3); // 删掉当前之后的
    expect(app.track.ref!.id, '2');
    expect(_ids(app), ['1', '2', '3']);
    app.removeQueueAt(1); // 删掉当前：接着放下一首
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
