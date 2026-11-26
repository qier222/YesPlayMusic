import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/pages/album.dart';
import 'package:yesplaymusic/pages/common.dart';
import 'package:yesplaymusic/shell.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/ui.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

void main() {
  setUpAll(prepareEnv);

  testWidgets('album info fits above the mini player at 1280×800', (t) async {
    t.view.physicalSize = const Size(1280, 1000);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);

    final app = AppState()..clearQueue();
    addTearDown(app.dispose);
    app.libraryAlbums = const [
      Album(
        id: 'test-album',
        title: 'WWWW WWWW',
        artist: 'Test Artist',
        cover: '',
        year: 2024,
        spine: 0,
      ),
    ];
    app.open(AppState.albumRoute('test-album'));
    await t.pumpWidget(appFor(app));
    await t.pumpAndSettle();

    final album = find.byType(AlbumPage);
    final cover = find.descendant(of: album, matching: find.byType(Cover));
    final back = find.descendant(of: album, matching: find.byType(BackBtn));
    final actions = [
      find.descendant(of: album, matching: find.byType(PlayPill)),
      for (final icon in ['heart', 'more'])
        find.descendant(
          of: album,
          matching: find.byWidgetPredicate(
            (w) => w is RoundBtn && w.icon == icon,
          ),
        ),
    ];
    final initialRects = actions.map(t.getRect).toList();
    final initialCover = t.getRect(cover);
    final initialBack = t.getRect(back);
    expect(initialCover.size, const Size.square(400));

    t.view.physicalSize = const Size(1280, 800);
    await t.pumpAndSettle();
    for (final (i, action) in actions.indexed) {
      expect(t.getRect(action), initialRects[i]);
      expect(action.hitTestable(), findsOneWidget);
    }

    app.addToQueue(Track.of(const m.Track(id: 'test-song', name: 'Test Song')));
    await t.pumpAndSettle();
    final volume = find.descendant(
      of: find.byType(MiniPlayer),
      matching: find.byType(VolumeSeg),
    );
    final playerTop =
        t.getBottomLeft(volume).dy - t.widget<VolumeSeg>(volume).base;
    for (final action in actions) {
      expect(t.getBottomLeft(action).dy, lessThanOrEqualTo(playerTop));
      expect(action.hitTestable(), findsOneWidget);
    }
    expect(t.getRect(back), initialBack);
    expect(back.hitTestable(), findsOneWidget);
    final compactCover = t.getRect(cover);
    expect(compactCover.topLeft, initialCover.topLeft);
    expect(compactCover.width, lessThan(400));
    expect(compactCover.height, compactCover.width);
    expect(compactCover.bottom, lessThan(t.getTopLeft(actions.first).dy));

    t.view.physicalSize = const Size(1280, 600);
    await t.pumpAndSettle();
    expect(t.getSize(cover), const Size.square(160));
    await t.sendEventToBinding(
      const PointerScrollEvent(
        position: Offset(300, 340),
        scrollDelta: Offset(0, 150),
      ),
    );
    await t.pumpAndSettle();
    final extremePlayerTop =
        t.getBottomLeft(volume).dy - t.widget<VolumeSeg>(volume).base;
    for (final action in actions) {
      expect(t.getBottomLeft(action).dy, lessThanOrEqualTo(extremePlayerTop));
      expect(action.hitTestable(), findsOneWidget);
    }

    t.view.physicalSize = const Size(1280, 1000);
    await t.pumpAndSettle();
    expect(t.getRect(cover), initialCover);
    expect(t.getRect(back), initialBack);
    for (final (i, action) in actions.indexed) {
      expect(t.getRect(action), initialRects[i]);
      expect(action.hitTestable(), findsOneWidget);
    }
  });
}
