// Common widgets: tooltip pill.

import 'dart:async';

import 'package:flutter/widgets.dart';

import '../theme.dart';

// ───────────── Tooltip pill ─────────────

/// The design's dark pill tooltip, placed 10px above the element.
class TipAnchor extends StatefulWidget {
  const TipAnchor({
    super.key,
    required this.text,
    required this.show,
    required this.child,
    this.onCover = false,
    this.dx,
  });
  final String text;
  final bool show;
  final bool onCover;
  // When set, the tooltip sits at horizontal offset dx within the element (progress preview)
  final double? dx;
  final Widget child;

  @override
  State<TipAnchor> createState() => _TipAnchorState();
}

class _TipAnchorState extends State<TipAnchor> {
  final _link = LayerLink();
  final _ctrl = OverlayPortalController();
  Timer? _delay;

  @override
  void didUpdateWidget(covariant TipAnchor old) {
    super.didUpdateWidget(old);
    _sync();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  void _sync() {
    if (!mounted) return;
    if (widget.show && !_ctrl.isShowing) {
      _delay?.cancel();
      // Button tooltips appear after a delay so passing the mouse over doesn't bother; progress previews (dx) show immediately
      _delay = Timer(Duration(milliseconds: widget.dx != null ? 0 : 600), () {
        if (mounted && widget.show) _ctrl.show();
      });
    } else if (!widget.show) {
      _delay?.cancel();
      // OverlayPortal can't be hidden directly during build, so defer it until after this frame
      if (_ctrl.isShowing) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && !widget.show && _ctrl.isShowing) _ctrl.hide();
        });
      }
    }
  }

  @override
  void dispose() {
    _delay?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return OverlayPortal(
      controller: _ctrl,
      overlayChildBuilder: (ctx) {
        final dx = widget.dx;
        return Align(
          alignment: Alignment.topLeft,
          child: CompositedTransformFollower(
            link: _link,
            showWhenUnlinked: false,
            targetAnchor: dx == null ? Alignment.topCenter : Alignment.topLeft,
            followerAnchor: Alignment.bottomCenter,
            offset: Offset(dx ?? 0, -10),
            child: IgnorePointer(
              child: TipPill(text: widget.text, onCover: widget.onCover),
            ),
          ),
        );
      },
      child: CompositedTransformTarget(link: _link, child: widget.child),
    );
  }
}

class TipPill extends StatelessWidget {
  const TipPill({super.key, required this.text, this.onCover = false});
  final String text;
  final bool onCover;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 140),
      curve: Curves.easeOut,
      builder: (_, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(
          offset: Offset(0, (1 - t) * 4),
          child: child,
        ),
      ),
      child: Container(
        height: 30,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: squircle(
          15,
          color: onCover ? ba(0.75) : const Color(0xFF2E2E33),
          shadows: onCover
              ? null
              : [
                  BoxShadow(
                    color: ba(0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
        ),
        // widthFactor: 1 makes the pill shrink to the text, otherwise the overlay's full-width constraint stretches it
        child: Center(
          widthFactor: 1,
          child: tx(text, 12, w: w700, c: const Color(0xFFF7F7F8), tnum: true),
        ),
      ),
    );
  }
}
