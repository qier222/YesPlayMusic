// Now Playing page: the cover on the right scales with window size, stays out of the lyrics area on the left, and is vertically centered on the right when space is tight.
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/pages/now_playing.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/ui.dart' show Cover;

import 'pages_smoke_test.dart' show appFor, prepareEnv;

void main() {
  late AppState app;

  setUpAll(prepareEnv);

  setUp(() {
    app = AppState();
    app.clearQueue();
    app.playList(const [
      Track(
        title: '测试歌曲',
        artist: '测试歌手',
        album: '测试专辑',
        cover: '',
        seconds: 200,
      ),
    ]);
  });
  tearDown(() => app.dispose());

  Future<Rect> measureCover(WidgetTester t, Size window) async {
    t.view.physicalSize = window;
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    await t.pumpWidget(appFor(app));
    app.openNowPlaying(NpTab.lyrics);
    for (var i = 0; i < 10; i++) {
      await t.pump(const Duration(milliseconds: 100));
    }
    expect(t.takeException(), isNull);
    final cover = find.descendant(
      of: find.byType(NowPlayingPage),
      matching: find.byType(Cover),
    );
    expect(cover, findsOneWidget);
    return t.getRect(cover);
  }

  testWidgets('右侧封面随窗口宽高自适应且不侵入左侧歌词区，受限时垂直居中', (t) async {
    final r1280 = await measureCover(t, const Size(1280, 800));
    final r1440 = await measureCover(t, const Size(1440, 900));
    final r1920 = await measureCover(t, const Size(1920, 1080));
    final rNarrowTall = await measureCover(t, const Size(1280, 1200));

    // Grows with larger windows and shrinks at the minimum window size to stay clear of the lyrics area (x = 820)
    expect(r1280.width, lessThan(r1440.width));
    expect(r1440.width, lessThan(r1920.width));
    expect(r1280.left, greaterThan(820));
    expect(r1440.left, greaterThan(820));
    expect(r1920.left, greaterThan(820));

    // In a narrow, tall window it's width-constrained and can't grow, so it should be vertically centered within [80, H - 110] on the right
    expect(rNarrowTall.width, closeTo(r1280.width, 1.0));
    const expectedCenterY = 80.0 + (1200.0 - 80.0 - 110.0) / 2;
    expect(rNarrowTall.center.dy, closeTo(expectedCenterY, 2.0));
  });
}
