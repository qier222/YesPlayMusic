import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart' show ValueListenable;
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../cover_color.dart';
import '../l10n/l10n.dart';
import '../music/source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';

/// 在这个元素正下方弹出菜单（「更多」按钮用）。
void menuBelow(BuildContext context, MenuSpec spec) {
  final box = context.findRenderObject() as RenderBox;
  showMenu(context, box.localToGlobal(Offset(0, box.size.height + 6)), spec);
}

/// 规范圆形图标按钮（次要样式，开着时图标变主题色）。
class RoundBtn extends StatelessWidget {
  const RoundBtn({
    super.key,
    required this.icon,
    required this.tip,
    this.on = false,
    this.onTap,
    this.onCover = false,
    this.size = 48,
  });
  final String icon, tip;
  final bool on, onCover;
  final double size;
  final void Function(BuildContext context)? onTap;

  @override
  Widget build(BuildContext context) {
    final spec = BtnSize.fromHeight(size);
    final darkSurface = onCover || P.dark;
    final col = on
        ? (icon == 'heart-filled' ? heart : accent)
        : (darkSurface ? const Color(0xFFF7F7F8) : darkInk);
    final bg = darkSurface ? wa(0.08) : ba(0.06);
    final hover = darkSurface ? wa(0.12) : ba(0.10);
    final press = darkSurface ? wa(0.04) : ba(0.04);
    return Builder(
      builder: (ctx) => Tap(
        tip: tip,
        tipOnCover: onCover,
        onTap: () => onTap?.call(ctx),
        builder: (_, h, p) => PressScale(
          pressed: p,
          down: 0.9,
          child: AnimatedContainer(
            duration: fast,
            width: spec.height,
            height: spec.height,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: p ? press : (h ? hover : bg),
              shape: BoxShape.circle,
            ),
            child: TweenAnimationBuilder<double>(
              key: ValueKey('$icon$on'),
              tween: Tween(begin: on ? 1.3 : 0.9, end: 1),
              duration: const Duration(milliseconds: 380),
              curve: bouncy,
              builder: (_, s, c) => Transform.scale(scale: s, child: c),
              child: Ico(icon, size: spec.icon, color: col),
            ),
          ),
        ),
      ),
    );
  }
}

/// 页面上半部分的封面色背景：顶部是封面深色，向下渐变到页面底色。
/// 取代原来的封面模糊背景。
class CoverWash extends StatelessWidget {
  const CoverWash({super.key, required this.coverId, this.height = 640});
  final String coverId;
  final double height;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CoverTone(
        coverId: coverId,
        builder: (_, p) => Align(
          alignment: Alignment.topCenter,
          child: Container(
            height: height,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  p.deep,
                  p.deep.withValues(alpha: 0.55),
                  P.ground.withValues(alpha: 0),
                ],
                stops: const [0, 0.45, 1],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class InputBox extends StatelessWidget {
  const InputBox({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.placeholder,
    this.size = 13,
    this.weight = FontWeight.w500,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.color,
    this.maxLength,
  });

  /// 最多多少个字（按字符算，不是 UTF-16 单元）。
  final int? maxLength;
  final TextEditingController controller;
  final FocusNode focusNode;
  final String placeholder;
  final double size;
  final FontWeight weight;
  final ValueChanged<String>? onChanged, onSubmitted;
  final bool autofocus;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.centerLeft,
      children: [
        ListenableBuilder(
          listenable: controller,
          builder: (_, _) => controller.text.isEmpty
              ? IgnorePointer(
                  child: tx(placeholder, size, w: weight, c: P.faint),
                )
              : const SizedBox.shrink(),
        ),
        EditableText(
          controller: controller,
          focusNode: focusNode,
          autofocus: autofocus,
          style: ts(size, w: weight, c: color ?? P.ink),
          cursorColor: accent,
          inputFormatters: [
            if (maxLength != null) LengthLimitingTextInputFormatter(maxLength),
          ],
          backgroundCursorColor: P.muted,
          selectionColor: accent.withValues(alpha: 0.35),
          cursorWidth: 2,
          cursorRadius: const Radius.circular(1),
          onChanged: onChanged,
          onSubmitted: onSubmitted,
          maxLines: 1,
        ),
      ],
    );
  }
}

/// 列表行最左边：悬停变播放/暂停，正在播放显示音符，否则是序号。
class RowIndex extends StatelessWidget {
  const RowIndex({
    super.key,
    required this.n,
    required this.hover,
    required this.current,
    required this.playing,
    this.width = 32,
    this.align = Alignment.centerLeft,
    this.onTap,
    this.color,
  });
  final int n;
  final bool hover, current, playing;
  final double width;
  final Alignment align;
  final VoidCallback? onTap;

  /// 序号的颜色，默认 [P.faint]；要和同一行的时长一个颜色时传进来。
  final Color? color;

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (hover) {
      child = Ico(
        current && playing ? 'pause' : 'play',
        key: const ValueKey('h'),
        size: 16,
        color: P.ink,
      );
    } else if (current) {
      child = PlayingBars(key: const ValueKey('m'), playing: playing);
    } else {
      child = tx(
        '$n',
        13,
        key: const ValueKey('n'),
        w: w600,
        c: color ?? P.faint,
        tnum: true,
      );
    }
    final box = SizedBox(
      width: width,
      height: double.infinity,
      child: Align(
        alignment: align,
        child: AnimatedSwitcher(
          transitionBuilder: fadeOnly,
          duration: const Duration(milliseconds: 120),
          child: child,
        ),
      ),
    );
    if (hover && onTap != null) {
      return Tap(onTap: onTap, builder: (_, _, _) => box);
    }
    return box;
  }
}

/// Sketch 组件 `Search Field/胶囊 56`：56 高全圆角胶囊、白 8% 底、22 放大镜、20 字、右侧清除/状态。
class SearchFieldBar extends StatelessWidget {
  const SearchFieldBar({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.placeholder,
    this.autofocus = true,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.trailing,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final String placeholder;
  final bool autofocus;
  final ValueChanged<String>? onChanged, onSubmitted;
  final VoidCallback? onClear;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final bg = P.dark
        ? (focusNode.hasFocus ? wa(0.11) : wa(0.08))
        : (focusNode.hasFocus ? ba(0.09) : ba(0.06));
    return GestureDetector(
      onTap: focusNode.requestFocus,
      child: AnimatedContainer(
        duration: fast,
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        decoration: squircle(28, color: bg),
        child: Row(
          children: [
            Ico('search', size: 24, color: P.muted),
            const SizedBox(width: 14),
            Expanded(
              child: InputBox(
                controller: controller,
                focusNode: focusNode,
                autofocus: autofocus,
                placeholder: placeholder,
                size: 20,
                weight: w700,
                color: P.ink,
                onChanged: onChanged,
                onSubmitted: onSubmitted,
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: 12),
              trailing!,
            ] else if (onClear != null && controller.text.isNotEmpty) ...[
              const SizedBox(width: 12),
              Tap(
                tip: context.l10n.actionClear,
                onTap: onClear,
                builder: (_, h, _) =>
                    Ico('close', size: 24, color: h ? P.ink : P.muted),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Sketch 组件 `Tab/文字`；`showLine` 为 true 时带全宽分割线与底部选中指示条（搜索页、插件搜索页），
/// 为 false 时仅显示文字与数量（音乐库顶部导航）。
class LineTabs extends StatelessWidget {
  const LineTabs({
    super.key,
    required this.items,
    required this.selected,
    required this.onChanged,
    this.gap = 28,
    this.showLine = true,
  });

  final List<(String label, String? count)> items;
  final int selected;
  final ValueChanged<int> onChanged;
  final double gap;
  final bool showLine;

  @override
  Widget build(BuildContext context) {
    final row = Row(
      mainAxisSize: showLine ? MainAxisSize.max : MainAxisSize.min,
      children: [
        for (final (i, it) in items.indexed) ...[
          if (i > 0) SizedBox(width: gap),
          Tap(
            onTap: () => onChanged(i),
            builder: (_, h, _) {
              final active = i == selected;
              final content = SizedBox(
                height: 28,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    AnimatedDefaultTextStyle(
                      duration: fast,
                      style: ts(
                        20,
                        w: w700,
                        f: F.semi,
                        c: active ? P.ink : (h ? P.muted : P.faint),
                      ),
                      child: Text(it.$1),
                    ),
                    if (it.$2 != null) ...[
                      const SizedBox(width: 6),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: tx(
                          it.$2!,
                          13,
                          w: w700,
                          c: active ? P.muted : P.faint,
                          tnum: true,
                        ),
                      ),
                    ],
                  ],
                ),
              );
              if (!showLine) return content;
              return IntrinsicWidth(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    content,
                    const SizedBox(height: 6),
                    AnimatedOpacity(
                      duration: const Duration(milliseconds: 150),
                      opacity: active ? 1 : 0,
                      child: Container(height: 2, color: P.ink),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ],
    );
    if (!showLine) return row;
    return Stack(
      children: [
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: Container(height: 1, color: P.dark ? wa(0.08) : P.line),
        ),
        row,
      ],
    );
  }
}

/// Sketch 组件「播放中」：18×18，5 根 2px 竖条、圆角 0.7，中间最活跃（钟形包络）。
/// 播放时跳动；暂停时 5 根都收成 3px 并停住。
class PlayingBars extends StatefulWidget {
  const PlayingBars({
    super.key,
    required this.playing,
    this.color,
    this.rest = 0,
  });
  final bool playing;
  final Color? color;

  /// 暂停时条的高度（0~1）。0 是几个小点；首页电台卡片上停着也要看得出是指示条。
  final double rest;

  @override
  State<PlayingBars> createState() => _PlayingBarsState();
}

class _PlayingBarsState extends State<PlayingBars>
    with SingleTickerProviderStateMixin {
  // 一个周期 6 秒，每根条在周期里转整数圈，循环衔接处不跳。
  late final _c = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 6),
  );

  @override
  void initState() {
    super.initState();
    if (widget.playing) _c.repeat();
  }

  @override
  void didUpdateWidget(PlayingBars old) {
    super.didUpdateWidget(old);
    if (widget.playing && !_c.isAnimating) _c.repeat();
    if (!widget.playing && _c.isAnimating) _c.stop();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(end: widget.playing ? 1 : widget.rest),
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOut,
      builder: (_, level, _) => AnimatedBuilder(
        animation: _c,
        builder: (_, _) => CustomPaint(
          size: const Size(18, 18),
          painter: _BarsPainter(_c.value, level, widget.color ?? accent),
        ),
      ),
    );
  }
}

class _BarsPainter extends CustomPainter {
  _BarsPainter(this.t, this.level, this.color);
  final double t, level;
  final Color color;

  static const _peak = [8.0, 12.0, 16.0, 12.0, 8.0]; // 钟形包络
  static const _turns = [5, 7, 6, 8, 5]; // 每 6 秒转几圈（约 0.8~1.3 Hz）
  static const _phase = [0.0, 1.7, 0.6, 2.9, 4.1];

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color;
    for (var k = 0; k < 5; k++) {
      final wave =
          0.5 + 0.5 * math.sin(2 * math.pi * _turns[k] * t + _phase[k]);
      final h = 3 + (_peak[k] - 3) * (0.25 + 0.75 * wave) * level;
      final x = 1.5 + 3.5 * k;
      canvas.drawRSuperellipse(
        RSuperellipse.fromRectAndRadius(
          Rect.fromLTWH(x, (size.height - h) / 2, 2, h),
          const Radius.circular(0.7),
        ),
        p,
      );
    }
  }

  @override
  bool shouldRepaint(_BarsPainter o) =>
      o.t != t || o.level != level || o.color != color;
}

// ───────────── 通用弹窗（Sketch 组件对比「通用弹窗 · 定稿」） ─────────────
// 宽 400，内边距 32，圆角 28。顶部 64 的图标圆，下面依次是居中的标题（20）、
// 说明（14，行高 22）、可选的内容（输入框），最后是两个等宽的 L 按钮：
// 取消在左，确定在右。危险操作的图标圆和按钮是红的。Esc 取消，回车确定。

OverlayEntry? _actionEntry;

void _openActionDialog(
  BuildContext context, {
  required String icon,
  required String title,
  String? message,
  Widget? content,
  required String action,
  String? cancel,
  bool danger = false,
  ValueListenable<bool>? canSubmit,
  required VoidCallback onSubmit,
  required VoidCallback onCancel,
  required void Function(VoidCallback close) bindClose,
}) {
  final cancelLabel = cancel ?? context.l10n.actionCancel;
  _actionEntry?.remove();
  _actionEntry = null;
  late final OverlayEntry self;
  var closed = false;
  void close() {
    if (closed) return;
    closed = true;
    if (identical(_actionEntry, self)) _actionEntry = null;
    self.remove();
  }

  bindClose(close);
  void cancelNow() {
    onCancel();
    close();
  }

  void submitNow() {
    if (canSubmit != null && !canSubmit.value) return;
    onSubmit();
  }

  Widget buttons() {
    Widget ok(bool enabled) => Btn(
      label: action,
      size: BtnSize.l,
      kind: danger ? BtnKind.danger : BtnKind.primary,
      expand: true,
      enabled: enabled,
      onTap: submitNow,
    );
    return Row(
      children: [
        Expanded(
          child: Btn(
            label: cancelLabel,
            size: BtnSize.l,
            expand: true,
            onTap: cancelNow,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: canSubmit == null
              ? ok(true)
              : ValueListenableBuilder<bool>(
                  valueListenable: canSubmit,
                  builder: (_, v, _) => ok(v),
                ),
        ),
      ],
    );
  }

  self = _actionEntry = OverlayEntry(
    builder: (_) => Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
        SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
        SingleActivator(LogicalKeyboardKey.numpadEnter): ActivateIntent(),
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (_) {
              cancelNow();
              return null;
            },
          ),
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              submitNow();
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Stack(
            children: [
              Positioned.fill(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: cancelNow,
                  child: ColoredBox(color: ba(0.6)),
                ),
              ),
              Center(
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutCubic,
                  builder: (_, t, c) => Opacity(
                    opacity: t,
                    child: Transform.scale(scale: 0.96 + 0.04 * t, child: c),
                  ),
                  child: Container(
                    width: 400,
                    padding: const EdgeInsets.all(32),
                    decoration: squircle(
                      28,
                      color: const Color(0xFF1C1C1F),
                      side: BorderSide(color: wa(0.08)),
                      shadows: [
                        BoxShadow(
                          color: ba(0.6),
                          blurRadius: 64,
                          spreadRadius: -8,
                          offset: const Offset(0, 24),
                        ),
                        BoxShadow(
                          color: ba(0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Center(
                          child: Container(
                            width: 64,
                            height: 64,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: danger
                                  ? const Color(0x29E5484D)
                                  : wa(0.08),
                            ),
                            child: Ico(icon, size: 24),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          title,
                          textAlign: TextAlign.center,
                          style: ts(20, w: w700),
                        ),
                        if (message != null) ...[
                          const SizedBox(height: 10),
                          Text(
                            message,
                            textAlign: TextAlign.center,
                            style: ts(14, w: w500, c: wa(0.6), h: 22 / 14),
                          ),
                        ],
                        if (content != null) ...[
                          const SizedBox(height: 24),
                          content,
                        ],
                        const SizedBox(height: 32),
                        buttons(),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  Overlay.of(context, rootOverlay: true).insert(self);
}

/// 确认弹窗：确定返回 true，取消（按钮、Esc、点外面）返回 false。
/// [danger] 用在删除、退出登录这类操作上。[message] 里可以用 \n 自己断行。
Future<bool> confirmAction(
  BuildContext context, {
  required String icon,
  required String title,
  String? message,
  required String action,
  bool danger = false,
}) {
  final done = Completer<bool>();
  late VoidCallback close;
  _openActionDialog(
    context,
    icon: icon,
    title: title,
    message: message,
    action: action,
    danger: danger,
    onSubmit: () {
      if (!done.isCompleted) done.complete(true);
      close();
    },
    onCancel: () {
      if (!done.isCompleted) done.complete(false);
    },
    bindClose: (c) => close = c,
  );
  return done.future;
}

/// 弹窗让用户起个名字（新建歌单这类）。取消返回 null；名字去掉首尾空格，
/// 空的不让提交。输入框下面是左对齐的说明 [hint]，右边显示字数。
Future<String?> askName(
  BuildContext context, {
  required String title,
  required String placeholder,
  String? action,
  String initial = '',
  String icon = 'music',
  String? hint,
  int maxLength = 40,
}) {
  final actionLabel = action ?? context.l10n.actionConfirm;
  final done = Completer<String?>();
  final ctrl = TextEditingController(text: initial);
  final focus = FocusNode();
  final valid = ValueNotifier(initial.trim().isNotEmpty);
  ctrl.addListener(() => valid.value = ctrl.text.trim().isNotEmpty);
  late VoidCallback close;
  void finish(String? v) {
    if (!done.isCompleted) done.complete(v);
    close();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ctrl.dispose();
      focus.dispose();
      valid.dispose();
    });
  }

  _openActionDialog(
    context,
    icon: icon,
    title: title,
    action: actionLabel,
    canSubmit: valid,
    content: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: squircle(24, color: wa(0.08)),
          child: Row(
            children: [
              Expanded(
                child: InputBox(
                  controller: ctrl,
                  focusNode: focus,
                  placeholder: placeholder,
                  size: 15,
                  autofocus: true,
                  maxLength: maxLength,
                  onSubmitted: (_) {
                    if (valid.value) finish(ctrl.text.trim());
                  },
                ),
              ),
              const SizedBox(width: 12),
              ListenableBuilder(
                listenable: ctrl,
                builder: (_, _) => tx(
                  '${ctrl.text.characters.length} / $maxLength',
                  12,
                  w: w600,
                  c: wa(0.35),
                  tnum: true,
                ),
              ),
            ],
          ),
        ),
        if (hint != null) ...[
          const SizedBox(height: 10),
          tx(hint, 12, w: w500, c: wa(0.4)),
        ],
      ],
    ),
    onSubmit: () => finish(ctrl.text.trim()),
    onCancel: () => finish(null),
    bindClose: (c) => close = c,
  );
  // 弹窗外层也要焦点（接 Esc），输入框得在它之后再要
  WidgetsBinding.instance.addPostFrameCallback((_) => focus.requestFocus());
  return done.future;
}

/// 退出某个源的账号前先问一下。退出了返回 true。
Future<bool> confirmSignOut(BuildContext context, Source s) async {
  final l = context.l10n;
  final ok = await confirmAction(
    context,
    icon: 'user',
    title: l.signOutConfirmTitle(s.info.name),
    message: l.signOutConfirmMessage,
    action: l.actionSignOut,
    danger: true,
  );
  if (ok && context.mounted) await context.appRead.signOut(s);
  return ok;
}
