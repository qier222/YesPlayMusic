// Common widgets: fade-in, scrolling, toast, empty state, spinner.

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

import '../theme.dart';

// ───────────── Misc ─────────────

/// A slight rise and fade-in when the page enters (for staggered list items).
class FadeIn extends StatefulWidget {
  const FadeIn({super.key, required this.child, this.delay = 0, this.dy = 12});
  final Widget child;
  final int delay; // milliseconds
  final double dy;

  @override
  State<FadeIn> createState() => _FadeInState();
}

class _FadeInState extends State<FadeIn> {
  bool? _animate;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Play the entrance animation only when the list first appears. Rows lazily built while scrolling (or after scrolling away from the top)
    // show directly; otherwise rows revealed during fast scrolling would all be transparent and look like a black void.
    // Decided only the first time and never changed, so rows aren't torn down and rebuilt.
    if (_animate == null) {
      final pos = Scrollable.maybeOf(context)?.position;
      _animate =
          pos == null ||
          !pos.hasPixels ||
          // No content extent on the first layout: the list has just appeared
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

/// Scroll behavior that hides scrollbars.
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

  // macOS bounces by default; trackpad momentum events keep coming at the edge and fight the bounce animation,
  // so the list wobbles at the top/bottom (most visible on lists with a short scroll range). Stop at the edge.
  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const ClampingScrollPhysics();
}

/// A toast for placeholder actions like copying a link.
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

// ───────────── Empty state (Sketch final · empty state v30) ─────────────

/// A centered empty state: large title and button (description only used for errors). Shared by the library and Coverflow.
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

  /// Pages like Coverflow that always have a dark background.
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

/// Loading indicator: a spinning arc. Not shown if loading finishes within [delay], avoiding a flash.
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
