// Screen readers: buttons, icon buttons and switches need names and states.
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/ui.dart';

Widget _wrap(Widget child) => Directionality(
  textDirection: TextDirection.ltr,
  child: Center(child: child),
);

void main() {
  testWidgets('图标按钮用提示文字当名字', (t) async {
    final h = t.ensureSemantics();
    await t.pumpWidget(_wrap(IconBtn('play', tip: '播放', onTap: () {})));
    expect(
      t.getSemantics(find.byType(IconBtn)),
      matchesSemantics(
        label: '播放',
        isButton: true,
        hasEnabledState: true,
        isEnabled: true,
        hasTapAction: true,
      ),
    );
    h.dispose();
  });

  testWidgets('文字按钮把文字合并成名字', (t) async {
    final h = t.ensureSemantics();
    await t.pumpWidget(_wrap(Btn(label: '安装', onTap: () {})));
    expect(
      t.getSemantics(find.byType(Btn)),
      matchesSemantics(
        label: '安装',
        isButton: true,
        hasEnabledState: true,
        isEnabled: true,
        hasTapAction: true,
      ),
    );
    h.dispose();
  });

  testWidgets('开关报告开 / 关', (t) async {
    final h = t.ensureSemantics();
    var on = false;
    await t.pumpWidget(
      _wrap(
        StatefulBuilder(
          builder: (_, set) =>
              Toggle(value: on, onChanged: (v) => set(() => on = v)),
        ),
      ),
    );
    Matcher toggle(bool on) => matchesSemantics(
      hasToggledState: true,
      isToggled: on,
      hasEnabledState: true,
      isEnabled: true,
      hasTapAction: true,
    );
    expect(t.getSemantics(find.byType(Toggle)), toggle(false));
    await t.tap(find.byType(Toggle));
    await t.pump(const Duration(milliseconds: 400));
    expect(t.getSemantics(find.byType(Toggle)), toggle(true));
    h.dispose();
  });

  testWidgets('分段控件报告哪个选中', (t) async {
    final h = t.ensureSemantics();
    await t.pumpWidget(
      _wrap(
        Segmented(
          labels: const ['原文', '翻译'],
          selected: 1,
          onChanged: (_) {},
          width: 200,
          height: 32,
        ),
      ),
    );
    Matcher seg(String label, bool on) => matchesSemantics(
      label: label,
      isButton: true,
      hasSelectedState: true,
      isSelected: on,
      isInMutuallyExclusiveGroup: true,
      hasEnabledState: true,
      isEnabled: true,
      hasTapAction: true,
    );
    expect(t.getSemantics(find.text('原文')), seg('原文', false));
    expect(t.getSemantics(find.text('翻译')), seg('翻译', true));
    h.dispose();
  });
}
