// Now Playing page: the cover on the right scales with window size, stays out of the lyrics area on the left, and is vertically centered on the right when space is tight.
import 'dart:convert';
import 'dart:io';

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/l10n/l10n.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/pages/now_playing.dart';
import 'package:yesplaymusic/shell.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/ui.dart' show Cover, Ico;
import 'package:yesplaymusic/ui/tap.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

class _LyricsSource extends Source {
  _LyricsSource(this._lrc);
  final String _lrc;

  @override
  m.SourceInfo get info => const m.SourceInfo(id: 'test', name: 'Test');

  @override
  Set<String> get ops => const {Op.lyrics};

  @override
  Future<m.Lyrics> lyrics(String id) async => m.Lyrics(lrc: _lrc);
}

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

  testWidgets(
    'first lyric stays unhighlighted in Now Playing and hidden in mini-player before its timestamp',
    (t) async {
      // All tests in test/pages share one prefs.json; restore miniLyric when done.
      final prefsFile = File(p.join(AppState.supportDir(), 'prefs.json'));
      addTearDown(() {
        if (!prefsFile.existsSync()) return;
        final prefs = jsonDecode(prefsFile.readAsStringSync()) as Map;
        prefs.remove('miniLyric');
        prefsFile.writeAsStringSync(jsonEncode(prefs));
      });

      const firstLine = 'Twenty-five seconds in, first lyric line';
      const secondLine = 'At forty seconds, second lyric line';
      app.sources.add(
        _LyricsSource('[00:25.00]$firstLine\n[00:40.00]$secondLine'),
      );
      app.playList(const [
        Track(
          title: 'Intro Track',
          artist: 'Artist',
          album: 'Album',
          cover: '',
          seconds: 90,
          ref: m.Track(
            id: 'intro-1',
            name: 'Intro Track',
            source: 'test',
            duration: 90000,
          ),
        ),
      ]);
      app.miniLyric = true;

      t.view.physicalSize = const Size(1440, 900);
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.reset);

      await t.pumpWidget(appFor(app));
      await t.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 50)),
      );
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      expect(app.lyricLines, hasLength(2));

      // Before the first timestamp (0:03 < 0:25): no active cue, mini-player hides the lyric.
      app.seekTo(3);
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      expect(app.lyricIndex, -1);
      final miniLyricOpacity = t.widget<AnimatedOpacity>(
        find.descendant(
          of: find.byKey(const ValueKey('lyric')),
          matching: find.byType(AnimatedOpacity),
        ),
      );
      expect(miniLyricOpacity.opacity, 0);
      expect(
        find.descendant(
          of: find.byKey(const ValueKey('lyric')),
          matching: find.text(firstLine),
        ),
        findsNothing,
      );

      // Open Now Playing at 0:03: upcoming lines are shown dimmed and un-enlarged, and scrolling works.
      app.openNowPlaying(NpTab.lyrics);
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      expect(t.takeException(), isNull);

      final firstText = find.descendant(
        of: find.byType(NowPlayingPage),
        matching: find.text(firstLine),
      );
      expect(firstText, findsOneWidget);

      AnimatedOpacity rowOpacity() => t.widget<AnimatedOpacity>(
        find
            .ancestor(of: firstText, matching: find.byType(AnimatedOpacity))
            .first,
      );
      Transform rowTransform() => t.widget<Transform>(
        find.ancestor(of: firstText, matching: find.byType(Transform)).first,
      );

      expect(rowOpacity().opacity, closeTo(0.5, 0.01));
      expect(rowTransform().transform.storage[0], closeTo(0.55, 0.01));

      // Wheel scroll during the intro should browse without throwing.
      final center = t.getCenter(firstText);
      final pointer = TestPointer(1, PointerDeviceKind.mouse);
      t.binding.handlePointerEvent(pointer.hover(center));
      t.binding.handlePointerEvent(pointer.scroll(const Offset(0, 40)));
      await t.pump(const Duration(milliseconds: 100));
      expect(t.takeException(), isNull);

      // Tapping the first line seeks to its timestamp (0:25) and highlights/enlarges it.
      await t.tap(firstText);
      for (var i = 0; i < 12; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      expect(app.position, closeTo(25, 0.01));
      expect(app.lyricIndex, 0);
      expect(rowOpacity().opacity, closeTo(1.0, 0.01));
      expect(rowTransform().transform.storage[0], closeTo(1.0, 0.01));

      // Closing Now Playing at 0:25 shows the active line in the mini-player.
      app.closeNowPlaying();
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      final activeMiniOpacity = t.widget<AnimatedOpacity>(
        find.descendant(
          of: find.byKey(const ValueKey('lyric')),
          matching: find.byType(AnimatedOpacity),
        ),
      );
      expect(activeMiniOpacity.opacity, 1);
      expect(
        find.descendant(
          of: find.byKey(const ValueKey('lyric')),
          matching: find.text(firstLine),
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'lyricIndex returns -1 when empty and 0 at t=0 for [00:00.00] lyrics',
    (t) async {
      expect(app.lyricIndex, -1);

      app.sources.add(
        _LyricsSource('[00:00.00]Starts immediately\n[00:10.00]Next'),
      );
      app.playList(const [
        Track(
          title: 'Immediate',
          artist: 'Artist',
          album: 'Album',
          cover: '',
          seconds: 60,
          ref: m.Track(
            id: 'imm-1',
            name: 'Immediate',
            source: 'test',
            duration: 60000,
          ),
        ),
      ]);
      // Let audioCache.get settle, advance past the 300ms debounce, then let lyrics load.
      await t.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 50)),
      );
      await t.pump(const Duration(milliseconds: 350));
      await t.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 50)),
      );
      expect(app.lyricLines, hasLength(2));
      expect(app.position, 0);
      expect(app.lyricIndex, 0);
      app.seekTo(10);
      expect(app.lyricIndex, 1);
      await t.pump(const Duration(seconds: 2));
    },
  );

  testWidgets(
    'repeat controls cycle through single-track mode in both players',
    (t) async {
      app.queue = [
        Track.of(const m.Track(id: 'repeat', source: 'test', name: 'Repeat')),
      ];
      app.setRepeatMode(PlaybackRepeatMode.all);
      t.view.physicalSize = const Size(1280, 800);
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.reset);
      await t.pumpWidget(appFor(app));
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }

      Finder control(Type surface, String tip) => find.descendant(
        of: find.byType(surface),
        matching: find.byWidgetPredicate((w) => w is Tap && w.tip == tip),
      );
      void expectIcon(Finder button, String icon) {
        expect(button, findsOneWidget);
        expect(
          find.descendant(
            of: button,
            matching: find.byWidgetPredicate((w) => w is Ico && w.name == icon),
          ),
          findsOneWidget,
        );
      }

      final miniAll = control(MiniPlayer, L.miniRepeatOn);
      expectIcon(miniAll, 'repeat');
      await t.tap(miniAll);
      await t.pump();
      expect(app.repeatMode, PlaybackRepeatMode.one);
      expectIcon(control(MiniPlayer, L.miniRepeatOne), 'repeat-one');

      app.openNowPlaying(NpTab.lyrics);
      for (var i = 0; i < 10; i++) {
        await t.pump(const Duration(milliseconds: 100));
      }
      final npOne = control(NowPlayingPage, L.miniRepeatOne);
      expectIcon(npOne, 'repeat-one');
      await t.tap(npOne);
      await t.pump();
      expect(app.repeatMode, PlaybackRepeatMode.off);
      expectIcon(control(NowPlayingPage, L.miniRepeatOff), 'repeat');
    },
  );
}
