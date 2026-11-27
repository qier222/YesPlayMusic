import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/l10n/l10n.dart';
import 'package:yesplaymusic/pages/library.dart';
import 'package:yesplaymusic/state.dart';

import 'pages_smoke_test.dart' show prepareEnv;

class _LibraryApp extends AppState {
  @override
  final SourceLibrary library = SourceLibrary();
}

class _TrackedSong extends Track {
  _TrackedSong()
    : super(title: 'Old song', artist: '', cover: '', seconds: 180);

  int durationReads = 0;

  @override
  String get dur {
    durationReads++;
    return super.dur;
  }
}

void main() {
  setUpAll(prepareEnv);

  testWidgets('scrolling updates the year rail without reformatting songs', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final oldSong = _TrackedSong();
    final app = _LibraryApp();
    addTearDown(app.dispose);
    app.library.tracks = [
      oldSong,
      for (var i = 0; i < 40; i++)
        Track(
          title: 'Song $i',
          artist: '',
          cover: '',
          seconds: 180,
          added: DateTime(2025, 1, i + 1),
        ),
    ];
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF0B0B0D),
        locale: const Locale('en'),
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        builder: (context, _) {
          syncGlobalL10n(context);
          return AppScope(
            state: app,
            child: const LibraryPage(tab: 'songs'),
          );
        },
      ),
    );
    await tester.pumpAndSettle();

    final list = find.byType(ListView);
    final controller = tester.widget<ListView>(list).controller!;
    final rail = find.byWidgetPredicate(
      (w) => w is CustomPaint && w.size.width == 44 && w.painter != null,
    );
    final oldPaint = tester.widget<CustomPaint>(rail).painter!;
    expect(find.text(oldSong.title), findsNothing);
    final initialReads = oldSong.durationReads;
    expect(initialReads, greaterThan(0));

    await tester.sendEventToBinding(
      PointerScrollEvent(
        position: tester.getCenter(list),
        scrollDelta: const Offset(0, 300),
      ),
    );
    await tester.pump();

    expect(controller.offset, 300);
    expect(
      tester.widget<CustomPaint>(rail).painter!.shouldRepaint(oldPaint),
      isTrue,
    );
    expect(oldSong.durationReads, initialReads);
  });

  Future<void> pumpSongs(WidgetTester tester, _LibraryApp app) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF0B0B0D),
        locale: const Locale('en'),
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        builder: (context, _) {
          syncGlobalL10n(context);
          return AppScope(
            state: app,
            child: const LibraryPage(tab: 'songs'),
          );
        },
      ),
    );
    await tester.pumpAndSettle();
  }

  Finder findRail() => find.byWidgetPredicate(
    (w) => w is CustomPaint && w.painter is YearTicksPainter,
  );

  YearTicksPainter railPainter(WidgetTester tester) =>
      tester.widget<CustomPaint>(findRail()).painter! as YearTicksPainter;

  testWidgets(
    'year rail places labels at each year start, hovers accurately, and jumps to first song',
    (tester) async {
      final app = _LibraryApp();
      addTearDown(app.dispose);
      app.library.tracks = [
        for (var i = 0; i < 4; i++)
          Track(
            title: 'Nov $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2026, 11, 20 - i),
          ),
        for (var i = 0; i < 30; i++)
          Track(
            title: 'Oct $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2026, 10, 1),
          ),
        for (var i = 0; i < 10; i++)
          Track(
            title: 'Mar $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2020, 3, 1),
          ),
      ];
      await pumpSongs(tester, app);

      final rail = findRail();
      final railTopLeft = tester.getTopLeft(rail);
      final initial = railPainter(tester);
      expect(initial.placedMarks.map((p) => p.mark.label).toList(), [
        '2026',
        '2020',
      ]);
      final mark2026 = initial.placedMarks[0];
      final mark2020 = initial.placedMarks[1];
      expect(mark2026.mark.frac, 0.0);
      expect(mark2020.mark.frac, greaterThan(0.9));
      expect(mark2020.top, greaterThan(450));

      final pointer = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await pointer.addPointer(location: Offset.zero);
      addTearDown(pointer.removePointer);

      // Hover directly on the 2020 label -> must show 2020.03, not 2026.10.
      final label2020Center =
          railTopLeft + Offset(36, (mark2020.top + mark2020.bottom) / 2);
      await pointer.moveTo(label2020Center);
      await tester.pumpAndSettle();
      expect(railPainter(tester).hoverLabel, '2020.03');

      // Hover in the middle of the rail -> must show 2026.10.
      await pointer.moveTo(railTopLeft + const Offset(10, 200));
      await tester.pumpAndSettle();
      expect(railPainter(tester).hoverLabel, '2026.10');

      // Near a tick boundary, tapping an unmarked tick must scroll to the
      // same offset that hover previewed (the snapped tick center).
      final boundaryPos =
          railTopLeft + Offset(10, YearTicksPainter.yForTick(10) + 4);
      await pointer.moveTo(boundaryPos);
      await tester.pumpAndSettle();
      expect(railPainter(tester).hover, 10);
      await tester.tapAt(boundaryPos);
      await tester.pumpAndSettle();
      final listCtrl = tester
          .widget<ListView>(find.byType(ListView))
          .controller!;
      final offsetFromEdge = listCtrl.offset;
      expect(railPainter(tester).cur, 10);

      await tester.tapAt(
        railTopLeft + Offset(10, YearTicksPainter.yForTick(10)),
      );
      await tester.pumpAndSettle();
      expect(listCtrl.offset, closeTo(offsetFromEdge, 0.01));

      // Tap the 2020 label -> must scroll 2020-3 and first 2020 song to the top.
      await tester.tapAt(label2020Center);
      await tester.pumpAndSettle();
      expect(find.text('2020-3'), findsOneWidget);
      expect(find.text('Mar 0'), findsOneWidget);
      final listTop = tester.getTopLeft(find.byType(ListView)).dy;
      final headerTop = tester.getTopLeft(find.text('2020-3')).dy;
      expect(headerTop - listTop, lessThan(40));
      expect(railPainter(tester).cur, mark2020.tick);

      // Tap the 2026 label -> must jump back to the very top.
      final label2026Center =
          railTopLeft + Offset(36, (mark2026.top + mark2026.bottom) / 2);
      await tester.tapAt(label2026Center);
      await tester.pumpAndSettle();
      final controller = tester
          .widget<ListView>(find.byType(ListView))
          .controller!;
      expect(controller.offset, 0.0);
      expect(find.text('2026-11'), findsOneWidget);
      expect(find.text('Nov 0'), findsOneWidget);
    },
  );

  testWidgets(
    'clamped bottom year still hovers its own month and jumps to it',
    (tester) async {
      final app = _LibraryApp();
      addTearDown(app.dispose);
      app.library.tracks = [
        for (var i = 0; i < 30; i++)
          Track(
            title: 'Oct $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2026, 10, 1),
          ),
        for (var i = 0; i < 2; i++)
          Track(
            title: 'Mar $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2020, 3, 1),
          ),
      ];
      await pumpSongs(tester, app);

      final rail = findRail();
      final railTopLeft = tester.getTopLeft(rail);
      final mark2020 = railPainter(tester).placedMarks
          .firstWhere((p) => p.mark.label == '2020');
      expect(mark2020.mark.frac, 1.0);

      final pointer = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await pointer.addPointer(location: Offset.zero);
      addTearDown(pointer.removePointer);

      final label2020Center =
          railTopLeft + Offset(36, (mark2020.top + mark2020.bottom) / 2);
      await pointer.moveTo(label2020Center);
      await tester.pumpAndSettle();
      expect(railPainter(tester).hoverLabel, '2020.03');

      await tester.tapAt(label2020Center);
      await tester.pumpAndSettle();
      expect(find.text('2020-3'), findsOneWidget);
      expect(find.text('Mar 0'), findsOneWidget);
    },
  );

  testWidgets(
    'rail supports more than 6 years without fixed slots or overlap',
    (tester) async {
      final app = _LibraryApp();
      addTearDown(app.dispose);
      app.library.tracks = [
        for (var year = 2026; year >= 2019; year--)
          for (var i = 0; i < 12; i++)
            Track(
              title: 'Y$year-$i',
              artist: '',
              cover: '',
              seconds: 45,
              added: DateTime(year, 6, 1),
            ),
      ];
      await pumpSongs(tester, app);

      final rail = findRail();
      final railTopLeft = tester.getTopLeft(rail);
      final placed = railPainter(tester).placedMarks;
      expect(placed.length, 8);
      for (var i = 1; i < placed.length; i++) {
        expect(placed[i].top, greaterThan(placed[i - 1].bottom));
      }

      final mark2019 = placed.last;
      expect(mark2019.mark.label, '2019');
      await tester.tapAt(
        railTopLeft + Offset(36, (mark2019.top + mark2019.bottom) / 2),
      );
      await tester.pumpAndSettle();
      expect(find.text('2019-6'), findsOneWidget);
      expect(find.text('Y2019-0'), findsOneWidget);
    },
  );

  testWidgets(
    'undated Earlier tracks and short non-scrollable lists work safely',
    (tester) async {
      final app = _LibraryApp();
      addTearDown(app.dispose);
      app.library.tracks = [
        for (var i = 0; i < 3; i++)
          Track(
            title: 'Recent $i',
            artist: '',
            cover: '',
            seconds: 45,
            added: DateTime(2026, 5, 1),
          ),
        Track(title: 'Undated', artist: '', cover: '', seconds: 45),
      ];
      await pumpSongs(tester, app);

      final rail = findRail();
      final railTopLeft = tester.getTopLeft(rail);
      final placed = railPainter(tester).placedMarks;
      expect(placed.map((p) => p.mark.label).toList(), ['2026']);

      final pointer = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await pointer.addPointer(location: Offset.zero);
      addTearDown(pointer.removePointer);

      // Hover near the bottom of the rail -> shows Earlier label without NaN/errors.
      await pointer.moveTo(railTopLeft + const Offset(10, 520));
      await tester.pumpAndSettle();
      expect(railPainter(tester).hoverLabel, 'Earlier');

      // Tapping on a non-scrollable list is a safe no-op.
      await tester.tapAt(railTopLeft + const Offset(36, 30));
      await tester.pumpAndSettle();
      expect(find.text('Recent 0'), findsOneWidget);
    },
  );
}
