// 通用组件：悬停、按下：Tap、PressScale。

import 'package:flutter/widgets.dart';

import '../theme.dart';
import 'menu.dart';
import 'tip.dart';

// ───────────── 悬停 / 按下 ─────────────

typedef HoverBuilder = Widget Function(
  BuildContext context,
  bool hover,
  bool pressed,
);

/// 按钮提示只在这个作用域里出现（底部迷你播放条、正在播放页底部播放条）。
class TipScope extends InheritedWidget {
  const TipScope({super.key, required super.child});

  static bool enabled(BuildContext context) =>
      context.getInheritedWidgetOfExactType<TipScope>() != null;

  @override
  bool updateShouldNotify(TipScope oldWidget) => false;
}

/// 所有可点元素的基础：悬停、按下、点击、右键菜单、提示。
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

  /// 读屏念的名字；不给就用 [tip]，再没有就合并里面的文字。
  final String? semanticLabel;

  /// 开关类控件的状态（读屏念「开 / 关」）。
  final bool? toggled;

  /// 分段、标签这类多选一控件里是不是选中的那个。
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
              // 菜单开着时这一行保持悬停样式
              menuOwner.value = this;
            },
      child: widget.builder(context, _hover || _owned, _pressed),
    );
    // 只有底部播放器（TipScope 内）显示按钮提示
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
    // 读屏：能点的是按钮，里面的文字合并成按钮的名字（图标按钮用提示文字）
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

/// 按下时轻微缩放。
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
