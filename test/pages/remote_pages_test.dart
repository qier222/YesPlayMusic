// Plugin pages: render content when there's data; show the error without throwing when the source errors.
import 'package:flutter/rendering.dart' show RenderParagraph;
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/ui.dart';

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
  _Demo({
    this.fail = false,
    this.albumCount = 0,
    this.albumArtistCount = 1,
    this.artistImage = '',
    this.profileImage = '',
    this.failArtist = false,
  });
  final bool fail;
  final int albumCount, albumArtistCount;
  final String artistImage, profileImage;
  final bool failArtist;
  int artistCalls = 0;

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
          album: m.Album(
            id: 'al1',
            name: '测试专辑',
            imageUrl: 'test-album-cover',
            artists: [
              m.Artist(id: 'a1', name: '测试歌手', imageUrl: artistImage),
              for (var i = 2; i <= albumArtistCount; i++)
                m.Artist(id: 'a$i', name: 'Guest Artist $i'),
            ],
            released: '2022-12-09',
            copyright: '℗ 2022 Demo Records',
          ),
          tracks: [for (var i = 0; i < 10; i++) _track(i)],
        );

  @override
  Future<m.ArtistPage> artist(String id) async {
    artistCalls++;
    return fail || failArtist
        ? _boom()
        : m.ArtistPage(
            artist: m.Artist(id: id, name: '测试歌手', imageUrl: profileImage),
            tracks: [for (var i = 0; i < 10; i++) _track(i)],
            albums: [
              for (var i = 0; i < albumCount; i++)
                m.Album(
                  id: 'disc$i',
                  name: '发行 $i',
                  released:
                      '${2026 - i ~/ 12}-${(12 - i % 12).toString().padLeft(2, '0')}-01',
                ),
            ],
          );
  }

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
    ('Atlas', m.SearchKind.albums) => m.SearchResult(
      albums: [
        for (var i = 1; i <= 5; i++)
          m.Album(id: 'atlas$i', name: 'Atlas Volume $i'),
      ],
      total: 5,
    ),
    ('Atlas', m.SearchKind.artists) => const m.SearchResult(
      artists: [m.Artist(id: 'a2', name: 'Atlas Artist')],
    ),
    ('Paged', m.SearchKind.albums) => m.SearchResult(
      albums: [
        for (var i = 1; i <= 8; i++)
          m.Album(id: 'paged$i', name: 'Paged Album $i'),
      ],
      more: true,
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

  Future<AppState> boot(
    WidgetTester t, {
    bool fail = false,
    int albumCount = 0,
    int albumArtistCount = 1,
    String artistImage = '',
    String profileImage = '',
    bool failArtist = false,
  }) async {
    t.view.physicalSize = const Size(1280, 800);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    final app = AppState()..clearQueue();
    addTearDown(app.dispose);
    app.sources.add(
      _Demo(
        fail: fail,
        albumCount: albumCount,
        albumArtistCount: albumArtistCount,
        artistImage: artistImage,
        profileImage: profileImage,
        failArtist: failArtist,
      ),
    );
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

  testWidgets('search All offers View all only when album matches are hidden', (
    t,
  ) async {
    final app = await boot(t);
    app.open('/search');
    await _frames(t);
    await t.enterText(find.byType(EditableText), 'Atlas');
    await _frames(t);

    final cards = find.textContaining('Atlas Volume ');
    final viewAll = find.text('查看全部 5 张专辑');
    expect(cards, findsNWidgets(4));
    expect(viewAll, findsOneWidget);

    t.view.physicalSize = const Size(1440, 800);
    await _frames(t);
    expect(cards, findsNWidgets(5));
    expect(viewAll, findsNothing);
  });

  testWidgets('search All offers View all when more album pages exist', (
    t,
  ) async {
    final app = await boot(t);
    app.open('/search');
    await _frames(t);
    await t.enterText(find.byType(EditableText), 'Paged');
    await _frames(t);

    expect(find.textContaining('Paged Album '), findsNWidgets(8));
    expect(find.text('查看全部 8 张专辑'), findsOneWidget);
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

  testWidgets('long album artist credits stay within the cover column', (
    t,
  ) async {
    final app = await boot(t, albumArtistCount: 25);
    app.open('/album/@demo/al1');
    await _frames(t);

    expect(t.takeException(), isNull);
    final artist = find.text(app.albumOf('@demo/al1')!.artist);
    final infoColumn = t
        .element(artist)
        .findAncestorWidgetOfExactType<Column>()!;
    expect(
      t.getTopRight(artist).dx,
      lessThanOrEqualTo(t.getTopRight(find.byWidget(infoColumn)).dx),
    );
    final paragraph = t.renderObject<RenderParagraph>(artist);
    expect(paragraph.maxLines, 2);
    expect(paragraph.overflow, TextOverflow.ellipsis);
    expect(paragraph.didExceedMaxLines, isTrue);
  });

  testWidgets(
    'album artist avatar uses the artist image and preserves its route',
    (t) async {
      final app = await boot(t, artistImage: 'test-artist-avatar');
      app.open('/album/@demo/al1');
      await _frames(t);

      final album = app.albumOf('@demo/al1')!;
      expect(album.cover, 'test-album-cover');
      expect(album.artistImage, 'test-artist-avatar');
      expect(album.artistRoute, AppState.remoteRoute('artist', 'demo', 'a1'));
      expect(
        album.withReleased(DateTime(2022)).artistImage,
        'test-artist-avatar',
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 28 && w.id == 'test-artist-avatar',
        ),
        findsOneWidget,
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 400 && w.id == 'test-album-cover',
        ),
        findsOneWidget,
      );
      expect(t.takeException(), isNull);
    },
  );

  testWidgets(
    'missing album artist avatar shows a person instead of album art',
    (t) async {
      final app = await boot(t);
      app.open('/album/@demo/al1');
      await _frames(t);

      expect(app.albumOf('@demo/al1')!.artistImage, isEmpty);
      expect(
        find.byWidgetPredicate((w) => w is Cover && w.w == 28),
        findsNothing,
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is Ico && w.name == 'user' && w.size == 16,
        ),
        findsOneWidget,
      );
      expect(t.takeException(), isNull);
    },
  );

  testWidgets(
    'album fetches a missing artist avatar from the artist page once',
    (t) async {
      final app = await boot(t, profileImage: 'profile-avatar');
      app.open('/album/@demo/al1');
      await _frames(t);
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 28 && w.id == 'profile-avatar',
        ),
        findsOneWidget,
      );
      final source = app.sources['demo'] as _Demo;
      expect(source.artistCalls, 1);
      app.update(() {});
      await _frames(t);
      expect(source.artistCalls, 1);
      expect(t.takeException(), isNull);
    },
  );

  testWidgets(
    'artist profile replaces the generic image supplied by an album',
    (t) async {
      final app = await boot(
        t,
        artistImage: 'generic-avatar',
        profileImage: 'real-artist-avatar',
      );
      app.open('/album/@demo/al1');
      await _frames(t);
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 28 && w.id == 'real-artist-avatar',
        ),
        findsOneWidget,
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 28 && w.id == 'generic-avatar',
        ),
        findsNothing,
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is Cover && w.w == 400 && w.id == 'test-album-cover',
        ),
        findsOneWidget,
      );
      expect(t.takeException(), isNull);
    },
  );

  testWidgets(
    'artist fetch failure leaves the album usable and does not loop',
    (t) async {
      final app = await boot(t, failArtist: true);
      app.open('/album/@demo/al1');
      await _frames(t);
      expect(find.text('测试专辑'), findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (w) => w is Ico && w.name == 'user' && w.size == 16,
        ),
        findsOneWidget,
      );
      final source = app.sources['demo'] as _Demo;
      expect(source.artistCalls, 1);
      app.update(() {});
      await _frames(t);
      expect(source.artistCalls, 1);
      expect(t.takeException(), isNull);
    },
  );

  testWidgets('歌手页按需构建专辑卡片，翻页后显示下一屏', (t) async {
    final app = await boot(t, albumCount: 100);
    app.open('/artist/@demo/a1');
    await _frames(t);

    expect(find.text('发行 5'), findsOneWidget);
    expect(find.text('发行 11'), findsNothing);
    expect(find.text('发行 99'), findsNothing);

    await t.tap(
      find.byWidgetPredicate((w) => w is IconBtn && w.icon == 'chevron-right'),
    );
    await _frames(t);

    final nextPage = find.text('发行 11');
    expect(nextPage, findsOneWidget);
    expect(t.getCenter(nextPage).dx, lessThan(1280));
    expect(find.text('发行 99'), findsNothing);
    expect(t.takeException(), isNull);
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
