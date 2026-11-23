// Plugin pages: render content when there's data; show the error without throwing when the source errors.
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

m.Track _track(int i) => m.Track(
  id: 't$i',
  name: '测试歌曲 $i',
  source: 'demo',
  artists: const [m.Artist(id: 'a1', name: '测试歌手')],
  album: const m.Album(id: 'al1', name: '测试专辑'),
  duration: 200000,
);

class _Demo extends Source {
  _Demo({this.fail = false});
  final bool fail;

  @override
  final info = const m.SourceInfo(id: 'demo', name: 'Demo');

  @override
  Set<String> get ops => {Op.home, Op.playlist, Op.album, Op.artist};

  Never _boom() => throw SourceError(SourceErrorKind.failed, '服务器出错了');

  @override
  Future<m.Browse> home() async => fail
      ? _boom()
      : m.Browse(
          sections: [
            m.Section(
              title: '推荐歌曲',
              tracks: [for (var i = 0; i < 5; i++) _track(i)],
            ),
            const m.Section(
              title: '推荐歌单',
              playlists: [m.Playlist(id: 'pl1', name: '周末歌单')],
            ),
          ],
        );

  @override
  Future<m.Playlist> playlist(String id) async => fail
      ? _boom()
      : m.Playlist(
          id: id,
          name: '周末歌单',
          owner: '我',
          tracks: [for (var i = 0; i < 30; i++) _track(i)],
          trackCount: 30,
        );

  @override
  Future<m.AlbumPage> album(String id) async => fail
      ? _boom()
      : m.AlbumPage(
          album: const m.Album(
            id: 'al1',
            name: '测试专辑',
            artists: [m.Artist(id: 'a1', name: '测试歌手')],
            released: '2022-12-09',
            copyright: '℗ 2022 Demo Records',
          ),
          tracks: [for (var i = 0; i < 10; i++) _track(i)],
        );

  @override
  Future<m.ArtistPage> artist(String id) async => fail
      ? _boom()
      : m.ArtistPage(
          artist: const m.Artist(id: 'a1', name: '测试歌手'),
          tracks: [for (var i = 0; i < 10; i++) _track(i)],
        );
}

Future<void> _frames(WidgetTester t) async {
  for (var i = 0; i < 10; i++) {
    await t.pump(const Duration(milliseconds: 100));
  }
}

void main() {
  setUpAll(prepareEnv);

  Future<AppState> boot(WidgetTester t, {bool fail = false}) async {
    t.view.physicalSize = const Size(1280, 800);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    final app = AppState()..clearQueue();
    addTearDown(app.dispose);
    app.sources.add(_Demo(fail: fail));
    app.setSource('demo');
    await t.pumpWidget(appFor(app));
    await _frames(t);
    return app;
  }

  final pages = {
    '/home': '推荐歌曲',
    '/playlist/@demo/pl1': '周末歌单',
    '/album/@demo/al1': '测试专辑',
    '/artist/@demo/a1': '测试歌手',
  };

  testWidgets('专辑页底部：完整发行日期和版权', (t) async {
    final app = await boot(t);
    app.open('/album/@demo/al1');
    await _frames(t);
    expect(
      find.text('发行于 2022 年 12 月 9 日\n℗ 2022 Demo Records'),
      findsOneWidget,
    );
  });

  for (final e in pages.entries) {
    testWidgets('有数据：${e.key}', (t) async {
      final app = await boot(t);
      app.open(e.key);
      await _frames(t);
      expect(t.takeException(), isNull);
      expect(find.textContaining(e.value), findsWidgets);
      expect(find.textContaining('测试歌曲 0'), findsWidgets);
    });

    testWidgets('源报错：${e.key}', (t) async {
      final app = await boot(t, fail: true);
      app.open(e.key);
      await _frames(t);
      expect(t.takeException(), isNull);
      expect(find.textContaining('服务器出错了'), findsWidgets);
    });
  }
}
