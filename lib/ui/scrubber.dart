// 通用组件：进度条拖动。

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

// ───────────── 进度条拖动 ─────────────

/// 让一块区域可以悬停预览、按住拖动来设定 0..1 的值。
/// 进度条、音量条这类可以点、可以拖的条。
///
/// 按下和拖动时调 [onChanged]（只用来预览），松手时调 [onCommit]。
/// 直接用指针事件：点一下和拖动是同一个过程，按下的位置不会先“提交”一次。
class Scrubber extends StatefulWidget {
  const Scrubber({
    super.key,
    required this.builder,
    required this.onChanged,
    this.onCommit,
    this.vertical = false,
    this.onDragState,
    this.onScroll,
  });
  final Widget Function(BuildContext context, double? hoverAt, bool dragging)
  builder;
  final ValueChanged<double> onChanged;
  final ValueChanged<double>? onCommit;
  final bool vertical;
  final ValueChanged<bool>? onDragState;
  final ValueChanged<double>? onScroll;

  @override
  State<Scrubber> createState() => _ScrubberState();
}

class _ScrubberState extends State<Scrubber> {
  double? _hover;
  bool _drag = false;
  double _last = 0;

  double _frac(Offset local) {
    final size = (context.findRenderObject() as RenderBox).size;
    if (widget.vertical) return (1 - local.dy / size.height).clamp(0.0, 1.0);
    return (local.dx / size.width).clamp(0.0, 1.0);
  }

  void _move(Offset local) {
    _last = _frac(local);
    widget.onChanged(_last);
    setState(() => _hover = _last);
  }

  void _setDrag(bool v) {
    setState(() => _drag = v);
    widget.onDragState?.call(v);
  }

  void _end() {
    if (!_drag) return;
    _setDrag(false);
    widget.onCommit?.call(_last);
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      behavior: HitTestBehavior.opaque,
      onPointerSignal: (e) {
        if (e is PointerScrollEvent && widget.onScroll != null) {
          widget.onScroll!(e.scrollDelta.dy);
        }
      },
      onPointerDown: (e) {
        if (e.buttons & kPrimaryButton == 0) return;
        _setDrag(true);
        _move(e.localPosition);
      },
      onPointerMove: (e) {
        if (_drag) _move(e.localPosition);
      },
      onPointerUp: (e) {
        if (!_drag) return;
        _move(e.localPosition);
        _end();
      },
      onPointerCancel: (_) => _end(),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onHover: (e) => setState(() => _hover = _frac(e.localPosition)),
        onExit: (_) {
          if (!_drag) setState(() => _hover = null);
        },
        child: widget.builder(context, _hover, _drag),
      ),
    );
  }
}
