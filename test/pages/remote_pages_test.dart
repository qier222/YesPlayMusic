// 插件页面：有数据时把内容画出来；源报错时显示错误、不抛异常。
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
  Set<String> get ops => {Op.home, Op.playlist, Op.album, Op.artist, Op.search};

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

  @override
  Future<m.SearchResult> search(
    String query,
    m.SearchKind kind, {
    int offset = 0,
  }) async => switch ((query, kind)) {
    ('午夜', m.SearchKind.tracks) => m.SearchResult(tracks: [_track(0)]),
    ('夜晚', m.SearchKind.artists) => const m.SearchResult(
      artists: [m.Artist(id: 'a1', name: '测试歌手')],
    ),
    _ => const m.SearchResult(),
  };
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

  testWidgets('搜索分类分别显示空状态，其他结果仍然可见', (t) async {
    final app = await boot(t);
    app.open('/search');
    await _frames(t);

    Future<void> search(String query) async {
      await t.enterText(find.byType(EditableText), query);
      await _frames(t);
    }

    Future<void> select(String tab) async {
      await t.tap(find.text(tab));
      await _frames(t);
    }

    await search('午夜');
    expect(find.text('测试歌曲 0'), findsOneWidget);
    expect(find.text('没有找到歌单'), findsNothing);

    for (final (tab, title) in [
      ('专辑', '没有找到专辑'),
      ('歌手', '没有找到歌手'),
      ('歌单', '没有找到歌单'),
    ]) {
      await select(tab);
      expect(find.text(title), findsOneWidget);
      expect(find.text('测试歌曲 0'), findsNothing);
    }

    await select('歌曲');
    expect(find.text('没有找到歌单'), findsNothing);
    expect(find.text('测试歌曲 0'), findsOneWidget);

    await search('夜晚');
    expect(find.text('没有找到歌曲'), findsOneWidget);
    await select('歌手');
    expect(find.text('没有找到歌曲'), findsNothing);
    expect(find.text('测试歌手'), findsOneWidget);

    await select('全部');
    await search('无结果');
    expect(find.text('没有找到「无结果」'), findsOneWidget);
    expect(find.text('歌单'), findsNothing);
  });

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
