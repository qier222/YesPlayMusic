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
}
