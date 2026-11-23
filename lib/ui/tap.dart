// Common widgets: hover, press: Tap, PressScale.

import 'package:flutter/widgets.dart';

import '../theme.dart';
import 'menu.dart';
import 'tip.dart';

// ───────────── Hover / press ─────────────

typedef HoverBuilder = Widget Function(
  BuildContext context,
  bool hover,
  bool pressed,
);

/// Button tooltips only appear within this scope (bottom mini player bar, Now Playing's bottom player bar).
class TipScope extends InheritedWidget {
  const TipScope({super.key, required super.child});

  static bool enabled(BuildContext context) =>
      context.getInheritedWidgetOfExactType<TipScope>() != null;

  @override
  bool updateShouldNotify(TipScope oldWidget) => false;
}

/// The base for every tappable element: hover, press, tap, context menu, tooltip.
class Tap extends StatefulWidget {
  const Tap({
    super.key,
    required this.builder,
    this.onTap,
    this.onMenu,
    this.tip,
    this.tipOnCover = false,
    this.cursor = SystemMouseCursors.click,
    this.onHover,
    this.onDoubleTap,
    this.semanticLabel,
    this.toggled,
    this.selected,
  });

  final HoverBuilder builder;

  /// Name read by screen readers; falls back to [tip], then to the merged text inside.
  final String? semanticLabel;

  /// State of toggle controls (screen readers say "on / off").
  final bool? toggled;

  /// Whether it's the selected one in a one-of-many control like segments or tabs.
  final bool? selected;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final void Function(Offset global)? onMenu;
  final String? tip;
  final bool tipOnCover;
  final MouseCursor cursor;
  final ValueChanged<bool>? onHover;

  @override
  State<Tap> createState() => _TapState();
}

class _TapState extends State<Tap> {
  bool _hover = false;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    menuOwner.addListener(_owner);
  }

  @override
  void dispose() {
    menuOwner.removeListener(_owner);
    if (menuOwner.value == this) menuOwner.value = null;
    super.dispose();
  }

  bool _owned = false;
  void _owner() {
    final o = menuOwner.value == this;
    if (o != _owned) setState(() => _owned = o);
  }

  void _setHover(bool v) {
    if (_hover == v) return;
    setState(() => _hover = v);
    widget.onHover?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    Widget child = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      onDoubleTap: widget.onDoubleTap,
      onSecondaryTapUp: widget.onMenu == null
          ? null
          : (d) {
              widget.onMenu!(d.globalPosition);
              // Keep this row's hover style while the menu is open
              menuOwner.value = this;
            },
      child: widget.builder(context, _hover || _owned, _pressed),
    );
    // Only the bottom player (inside TipScope) shows button tooltips
    if (widget.tip != null && TipScope.enabled(context)) {
      child = TipAnchor(
        text: widget.tip!,
        show: _hover && !_pressed,
        onCover: widget.tipOnCover,
        child: child,
      );
    }
    child = MouseRegion(
      cursor: widget.cursor,
      onEnter: (_) => _setHover(true),
      onExit: (_) => _setHover(false),
      child: child,
    );
    // Screen readers: tappable things are buttons, and their inner text merges into the button name (icon buttons use the tooltip)
    if (widget.onTap == null && widget.onMenu == null) return child;
    return MergeSemantics(
      child: Semantics(
        button: widget.toggled == null,
        toggled: widget.toggled,
        selected: widget.selected,
        inMutuallyExclusiveGroup: widget.selected != null ? true : null,
        enabled: widget.onTap != null,
        label: widget.semanticLabel ?? widget.tip,
        child: child,
      ),
    );
  }
}

/// Scales down slightly when pressed.
class PressScale extends StatelessWidget {
  const PressScale({
    super.key,
    required this.pressed,
    required this.child,
    this.down = 0.92,
    this.hover = false,
    this.up = 1,
  });
  final bool pressed, hover;
  final double down, up;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: pressed ? down : (hover ? up : 1),
      duration: const Duration(milliseconds: 220),
      curve: pressed ? Curves.easeOut : bouncy,
      child: child,
    );
  }
}
