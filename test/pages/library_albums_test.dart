import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/pages/library.dart';
import 'package:yesplaymusic/state.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

class _LibraryApp extends AppState {
  @override
  final SourceLibrary library = SourceLibrary();
}

void main() {
  setUpAll(prepareEnv);

  testWidgets('collapsed spine keeps its title visible beside a long artist', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    const selected = Album(
      id: 'selected',
      title: 'Selected album',
      artist: 'Selected artist',
      cover: '',
      year: 2025,
      spine: 40,
    );
    final collapsed = Album(
      id: 'collapsed',
      title: 'Scout Ensemble',
      artist: List.generate(25, (i) => 'Scout Artist ${i + 1}').join(', '),
      cover: '',
      year: 2025,
      spine: 40,
    );
    final app = _LibraryApp();
    addTearDown(app.dispose);
    app.library.albums = [selected, collapsed];
    app.shelfId = selected.id;

    await tester.pumpWidget(
      appFor(app, child: const LibraryPage(tab: 'albums')),
    );
    await tester.pumpAndSettle();

    RenderParagraph spineText(String text) =>
        tester.renderObject<RenderParagraph>(
          find.descendant(
            of: find.byType(RotatedBox),
            matching: find.text(text),
          ),
        );

    final title = spineText(collapsed.title);
    expect(title.size.width, greaterThan(0));
    expect(title.didExceedMaxLines, isFalse);
    final artist = spineText(collapsed.artist);
    expect(artist.size.width, greaterThan(0));
    expect(artist.didExceedMaxLines, isTrue);
    expect(artist.overflow, TextOverflow.ellipsis);
    expect(tester.takeException(), isNull);
  });
}
