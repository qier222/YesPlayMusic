import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/pages/coverflow.dart';
import 'package:yesplaymusic/pages/library.dart';
import 'package:yesplaymusic/state.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

class _LibraryApp extends AppState {
  @override
  final SourceLibrary library = SourceLibrary()
    ..tracks = List.filled(
      1200,
      Track(title: 'Song', artist: '', cover: '', seconds: 180),
    );
}

void main() {
  setUpAll(prepareEnv);

  const pages = {
    'Library': LibraryPage(tab: 'albums'),
    'Coverflow': CoverflowPage(),
  };
  for (final page in pages.entries) {
    for (final (language, count) in [('en', '1,200'), ('de', '1.200')]) {
      testWidgets('${page.key} formats counts in $language', (tester) async {
        tester.view.physicalSize = const Size(1440, 900);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);
        final app = _LibraryApp();
        addTearDown(app.dispose);

        await tester.pumpWidget(
          appFor(app, child: page.value, locale: Locale(language)),
        );
        await tester.pumpAndSettle();

        expect(find.text(count), findsOneWidget);
      });
    }
  }
}
