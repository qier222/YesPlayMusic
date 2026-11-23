import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/ui.dart';

void main() {
  testWidgets('dragging previews; only the release commits', (tester) async {
    final moved = <double>[], committed = <double>[];
    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(
            width: 200,
            height: 20,
            child: Scrubber(
              onChanged: moved.add,
              onCommit: committed.add,
              builder: (_, _, _) => const SizedBox.expand(),
            ),
          ),
        ),
      ),
    );
    final g = await tester.startGesture(const Offset(20, 10));
    await g.moveTo(const Offset(100, 10));
    await g.moveTo(const Offset(150, 10));
    expect(committed, isEmpty);
    expect(moved.last, closeTo(0.75, 1e-9));
    await g.up();
    expect(committed, [closeTo(0.75, 1e-9)]);

    // A single click also commits once on release.
    await tester.tapAt(const Offset(50, 10));
    expect(committed, [closeTo(0.75, 1e-9), closeTo(0.25, 1e-9)]);
  });
}
