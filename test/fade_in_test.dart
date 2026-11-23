import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/ui.dart';

void main() {
  Widget list(ScrollController c) => Directionality(
    textDirection: TextDirection.ltr,
    child: ListView.builder(
      controller: c,
      itemCount: 500,
      itemBuilder: (_, i) => FadeIn(
        key: ValueKey(i),
        delay: 100,
        child: SizedBox(height: 40, child: Text('row $i')),
      ),
    ),
  );

  double opacityOf(WidgetTester t, int i) {
    final o = find.ancestor(
      of: find.text('row $i'),
      matching: find.byType(Opacity),
    );
    return o.evaluate().isEmpty ? 1 : t.widget<Opacity>(o.first).opacity;
  }

  testWidgets('列表刚出现时淡入，不报错', (t) async {
    final c = ScrollController();
    await t.pumpWidget(list(c));
    expect(t.takeException(), isNull);
    expect(opacityOf(t, 0), 0);
    await t.pumpAndSettle();
    expect(opacityOf(t, 0), 1);
  });

  testWidgets('滚动中新出现的行直接显示', (t) async {
    final c = ScrollController();
    await t.pumpWidget(list(c));
    await t.pumpAndSettle();
    await t.fling(find.byType(ListView), const Offset(0, -3000), 8000);
    await t.pump(const Duration(milliseconds: 16));
    await t.pump(const Duration(milliseconds: 16));
    expect(t.takeException(), isNull);
    final first = c.offset ~/ 40 + 1;
    expect(opacityOf(t, first), 1);
    await t.pumpAndSettle();
  });
}
