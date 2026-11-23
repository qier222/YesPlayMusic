// 通用组件：开关、分段。

import 'package:flutter/widgets.dart';

import '../theme.dart';
import 'tap.dart';

// ───────────── 开关 / 分段 ─────────────

/// 44×26 的开关，滑块弹簧移动，按下时拉长。
class Toggle extends StatelessWidget {
  const Toggle({super.key, required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Tap(
      onTap: () => onChanged(!value),
      toggled: value,
      builder: (_, h, p) => TweenAnimationBuilder<double>(
        tween: Tween(end: value ? 1 : 0),
        duration: const Duration(milliseconds: 320),
        curve: const SpringCurve(bounce: 0.2),
        builder: (_, k, _) {
          final kc = k.clamp(0.0, 1.0);
          final w = p ? 24.0 : 20.0;
          return Container(
            width: 44,
            height: 26,
            decoration: squircle(13, color: Color.lerp(P.raised, accent, kc)),
            child: Stack(
              children: [
                Positioned(
                  top: 3,
                  left: 3 + (18 + 20 - w) * k,
                  child: AnimatedContainer(
                    duration: fast,
                    width: w,
                    height: 20,
                    decoration: squircle(
                      10,
                      color: Color.lerp(
                        P.dark ? P.muted : white,
                        P.dark ? P.ground : white,
                        kc,
                      ),
                      shadows: P.dark
                          ? null
                          : [
                              BoxShadow(
                                color: ba(0.2),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// 带白色滑块的分段选择。
class Segmented extends StatelessWidget {
  const Segmented({
    super.key,
    required this.labels,
    required this.selected,
    required this.onChanged,
    required this.width,
    this.height = 36,
  });
  final List<String> labels;
  final int selected;
  final ValueChanged<int> onChanged;
  final double width, height;

  @override
  Widget build(BuildContext context) {
    final cw = (width - 8) / labels.length;
    return Container(
      width: width,
      height: height,
      decoration: squircle(height / 2, color: P.raised),
      child: Stack(
        children: [
          AnimatedPositioned(
            duration: const Duration(milliseconds: 360),
            curve: const SpringCurve(bounce: 0.12),
            left: 4 + selected * cw,
            top: 4,
            width: cw,
            height: height - 8,
            child: Container(
              decoration: squircle(
                (height - 8) / 2,
                color: P.thumb,
                shadows: [
                  BoxShadow(
                    color: ba(0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(4),
            child: Row(
              children: [
                for (var i = 0; i < labels.length; i++)
                  SizedBox(
                    width: cw,
                    child: Tap(
                      onTap: () => onChanged(i),
                      selected: i == selected,
                      builder: (_, h, _) => Center(
                        child: AnimatedDefaultTextStyle(
                          duration: fast,
                          style: ts(
                            13,
                            w: w700,
                            f: F.semi,
                            c: i == selected ? darkInk : (h ? P.ink : P.muted),
                          ),
                          child: Text(labels[i]),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
