// Coverflow 页面：
// 1. 封面高度随窗口高度等比缩放，全屏与最小窗口下都保持合适比例。
// 2. 艺人封面为圆形、优先显示艺人头像，点击中间播放图标随机播放艺人的所有歌曲。
import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

class _DemoSource extends Source {
  @override
  final info = const m.SourceInfo(id: 'demo', name: 'Demo');

  @override
  Set<String> get ops => {Op.savedAlbums, Op.liked, Op.artist};

  @override
  Future<List<m.Album>> savedAlbums({int offset = 0}) async => offset > 0
      ? const []
      : [
          for (var i = 0; i < 5; i++)
            m.Album(
              id: 'al$i',
              name: '测试专辑 $i',
              artists: const [m.Artist(id: 'a1', name: '测试歌手')],
            ),
        ];

  @override
  Future<m.TrackPage> liked({int offset = 0}) async => offset > 0
      ? const m.TrackPage(tracks: [], more: false)
      : const m.TrackPage(
          tracks: [
            m.Track(
              id: 'lt1',
              name: '喜欢的歌 1',
              source: 'demo',
              artists: [m.Artist(id: 'a1', name: '测试歌手')],
              album: m.Album(
                id: 'al0',
                name: '测试专辑 0',
                imageUrl: 'https://example.com/album-cover.jpg',
              ),
              duration: 180000,
            ),
            m.Track(
              id: 'lt2',
              name: '喜欢的歌 2',
              source: 'demo',
              artists: [m.Artist(id: 'a1', name: '测试歌手')],
              album: m.Album(
                id: 'al0',
                name: '测试专辑 0',
                imageUrl: 'https://example.com/album-cover.jpg',
              ),
              duration: 190000,
            ),
            m.Track(
              id: 'lt3',
              name: '喜欢的歌 3',
              source: 'demo',
              artists: [m.Artist(id: 'a1', name: '测试歌手')],
              album: m.Album(
                id: 'al0',
                name: '测试专辑 0',
                imageUrl: 'https://example.com/album-cover.jpg',
              ),
              duration: 200000,
            ),
          ],
          more: false,
        );

  @override
  Future<m.ArtistPage> artist(String id) async => m.ArtistPage(
    artist: m.Artist(
      id: id,
      name: '测试歌手',
      imageUrl: 'https://example.com/artist-avatar.jpg',
    ),
    tracks: [
      for (var i = 0; i < 6; i++)
        m.Track(
          id: 'at$i',
          name: '艺人歌曲 $i',
          source: 'demo',
          artists: [m.Artist(id: id, name: '测试歌手')],
          album: const m.Album(id: 'al0', name: '测试专辑 0'),
          duration: 200000,
        ),
    ],
  );
}

void main() {
  late AppState app;

  setUpAll(prepareEnv);

  setUp(() {
    app = AppState();
    app.clearQueue();
    app.sources.add(_DemoSource());
    app.setSource('demo');
  });
  tearDown(() => app.dispose());

  Future<void> pumpFrames(WidgetTester t) async {
    for (var i = 0; i < 10; i++) {
      await t.pump(const Duration(milliseconds: 100));
    }
  }

  Future<Size> measureFrontCover(WidgetTester t, Size window) async {
    t.view.physicalSize = window;
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    await t.pumpWidget(appFor(app));
    app.open('/coverflow/albums');
    await pumpFrames(t);
    expect(t.takeException(), isNull);
    final cover = find.byKey(const ValueKey(0));
    expect(cover, findsOneWidget);
    final box = find
        .descendant(of: cover, matching: find.byType(SizedBox))
        .first;
    return t.getSize(box);
  }

  testWidgets('封面高度随窗口高度等比缩放', (t) async {
    final s800 = await measureFrontCover(t, const Size(1280, 800));
    final s900 = await measureFrontCover(t, const Size(1440, 900));
    final s1080 = await measureFrontCover(t, const Size(1920, 1080));
    final s1440 = await measureFrontCover(t, const Size(2560, 1440));

    // 正方形封面，且严格按窗口高度等比缩放（基准 900 高对应 487.2）
    expect(s900.width, closeTo(487.2, 0.1));
    expect(s900.height, closeTo(487.2, 0.1));
    expect(s800.height, closeTo(487.2 * (800 / 900), 0.1));
    expect(s1080.height, closeTo(487.2 * (1080 / 900), 0.1));
    expect(s1440.height, closeTo(487.2 * (1440 / 900), 0.1));
    expect(s800.height, lessThan(s900.height));
    expect(s900.height, lessThan(s1080.height));
    expect(s1080.height, lessThan(s1440.height));
  });

  testWidgets('艺人 Coverflow 为圆形头像，点中间播放随机播放艺人全部歌曲', (t) async {
    t.view.physicalSize = const Size(1440, 900);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    await t.pumpWidget(appFor(app));
    app.open('/coverflow/artists');
    await pumpFrames(t);
    expect(t.takeException(), isNull);

    final cover = find.byKey(const ValueKey(0));
    expect(cover, findsOneWidget);

    // 艺人主封面和倒影都裁成圆形
    expect(
      find.descendant(of: cover, matching: find.byType(ClipOval)),
      findsNWidgets(2),
    );

    // 封面图片已替换成艺人头像（而不是曲目里的专辑封面）
    final images = t.widgetList<Image>(
      find.descendant(of: cover, matching: find.byType(Image)),
    );
    expect(images, isNotEmpty);
    final provider = images.first.image;
    final inner = provider is ResizeImage ? provider.imageProvider : provider;
    expect(inner.toString(), contains('artist-avatar.jpg'));

    // 悬停正面封面并点击中间播放图标
    final box = find
        .descendant(of: cover, matching: find.byType(SizedBox))
        .first;
    final center = t.getCenter(box);
    final mouse = await t.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: Offset.zero);
    addTearDown(mouse.removePointer);
    await mouse.moveTo(center);
    await pumpFrames(t);

    final playIcon = find.byKey(const ValueKey('play'));
    expect(playIcon, findsOneWidget);
    await t.tap(playIcon);
    await pumpFrames(t);

    expect(app.playing, isTrue);
    expect(app.queueFrom, 'artist:demo/a1');
    expect(app.queueName, '测试歌手');
    expect(
      app.queue.map((e) => e.title).toSet(),
      equals({for (var i = 0; i < 6; i++) '艺人歌曲 $i'}),
    );
  });

  testWidgets('歌曲 Coverflow 切到下一首时自动跳转到当前歌曲', (t) async {
    t.view.physicalSize = const Size(1440, 900);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    await t.pumpWidget(appFor(app));
    app.open('/coverflow/songs');
    await pumpFrames(t);
    expect(t.takeException(), isNull);

    // 播放歌曲列表并切到下一首
    app.playList(app.library!.tracks, start: 0, name: '音乐库');
    await pumpFrames(t);
    expect(find.text('喜欢的歌 1'), findsWidgets);

    app.next();
    await pumpFrames(t);
    expect(find.byKey(const ValueKey('0/1')), findsOneWidget);

    app.next();
    await pumpFrames(t);
    expect(find.byKey(const ValueKey('0/2')), findsOneWidget);
  });
}
