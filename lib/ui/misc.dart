// 通用组件：淡入、滚动、提示条、空状态、加载圈。

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

import '../theme.dart';

// ───────────── 杂项 ─────────────

/// 页面进入时轻微上浮淡入（用于列表项错峰出现）。
class FadeIn extends StatefulWidget {
  const FadeIn({super.key, required this.child, this.delay = 0, this.dy = 12});
  final Widget child;
  final int delay; // 毫秒
  final double dy;

  @override
  State<FadeIn> createState() => _FadeInState();
}

class _FadeInState extends State<FadeIn> {
  bool? _animate;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 只在列表刚出现时播入场动画。滚动中（或已经滚离顶部）懒加载出来的行
    // 直接显示，否则快速滚动时新露出来的行全是透明的，看起来一片黑。
    // 只在第一次决定，之后不变，免得行被拆掉重建。
    if (_animate == null) {
      final pos = Scrollable.maybeOf(context)?.position;
      _animate =
          pos == null ||
          !pos.hasPixels ||
          // 第一次布局时还没有内容范围：就是列表刚出现
          !pos.hasContentDimensions ||
          (!pos.isScrollingNotifier.value && pos.pixels <= pos.minScrollExtent);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_animate!) return widget.child;
    final delay = widget.delay;
    final total = 360 + delay;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: total),
      builder: (_, t, c) {
        final k = Curves.easeOutCubic.transform(
          ((t * total - delay) / 360).clamp(0.0, 1.0),
        );
        return Opacity(
          opacity: k,
          child: Transform.translate(
            offset: Offset(0, (1 - k) * widget.dy),
            child: c,
          ),
        );
      },
      child: widget.child,
    );
  }
}

/// 隐藏滚动条的滚动行为。
class NoBars extends ScrollBehavior {
  const NoBars();
  @override
  Widget buildScrollbar(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) => child;
  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.trackpad,
  };

  // macOS 默认会回弹；触控板的惯性事件到了边缘还在来，和回弹动画互相拉扯，
  // 列表在顶/底来回晃（可滚距离短的列表最明显）。到边就停。
  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const ClampingScrollPhysics();
}

/// 用于复制链接等假动作的轻提示。
final ValueNotifier<String?> toast = ValueNotifier(null);
Timer? _toastTimer;
void showToast(String s) {
  toast.value = s;
  _toastTimer?.cancel();
  _toastTimer = Timer(
    const Duration(milliseconds: 1800),
    () => toast.value = null,
  );
}

// ───────────── 空状态（Sketch 定稿 · 空状态 v30） ─────────────

/// 居中的空状态：大标题和按钮（说明只在出错时用）。音乐库和 Coverflow 共用。
class EmptyMessage extends StatelessWidget {
  const EmptyMessage({
    super.key,
    required this.title,
    this.sub,
    this.actions = const [],
    this.onDark = false,
  });

  final String title;
  final String? sub;
  final List<Widget> actions;

  /// Coverflow 这类始终是深色底的页面。
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        tx(
          title,
          30,
          w: w900,
          f: F.wide,
          c: onDark ? white : P.ink,
          align: TextAlign.center,
        ),
        if (sub != null) ...[
          const SizedBox(height: 10),
          tx(
            sub!,
            15,
            w: w600,
            c: onDark ? wa(0.6) : P.muted,
            align: TextAlign.center,
            lines: 2,
          ),
        ],
        if (actions.isNotEmpty) ...[
          const SizedBox(height: 24),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final (i, a) in actions.indexed) ...[
                if (i > 0) const SizedBox(width: 8),
                a,
              ],
            ],
          ),
        ],
      ],
    );
  }
}

/// 加载指示器：一段转着的弧线。[delay] 内加载完就不出现，免得一闪。
class Spinner extends StatefulWidget {
  const Spinner({
    super.key,
    this.size = 28,
    this.delay = const Duration(milliseconds: 150),
  });
  final double size;
  final Duration delay;

  @override
  State<Spinner> createState() => _SpinnerState();
}

class _SpinnerState extends State<Spinner> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();
  late final Timer _show;
  bool _on = false;

  @override
  void initState() {
    super.initState();
    _show = Timer(widget.delay, () {
      if (mounted) setState(() => _on = true);
    });
  }

  @override
  void dispose() {
    _show.cancel();
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedOpacity(
    opacity: _on ? 1 : 0,
    duration: const Duration(milliseconds: 200),
    child: RotationTransition(
      turns: _c,
      child: CustomPaint(
        size: Size.square(widget.size),
        painter: _ArcPainter(P.ink.withValues(alpha: 0.6)),
      ),
    ),
  );
}

class _ArcPainter extends CustomPainter {
  const _ArcPainter(this.color);
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    const w = 2.5;
    final r = Offset.zero & size;
    canvas.drawArc(
      r.deflate(w / 2),
      0,
      math.pi * 1.4,
      false,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = w
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_ArcPainter old) => old.color != color;
}
