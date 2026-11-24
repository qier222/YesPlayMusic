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

/// Shows a menu right below this element (for "More" buttons).
void menuBelow(BuildContext context, MenuSpec spec) {
  final box = context.findRenderObject() as RenderBox;
  showMenu(context, box.localToGlobal(Offset(0, box.size.height + 6)), spec);
}

/// Standard round icon button (secondary style; the icon turns the theme color when on).
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

/// Cover-color background for the top half of the page: the cover's deep color at the top, fading down to the page background.
/// Replaces the old blurred cover background.
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

  /// Maximum number of characters (counted as characters, not UTF-16 units).
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

/// Leftmost cell of a list row: play/pause on hover, a note while playing, otherwise the index.
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

  /// Color of the index, [P.faint] by default; pass one in to match the duration color on the same row.
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

/// Sketch component `Search Field/胶囊 56`: 56 high fully rounded capsule, white 8% fill, 22 magnifier, 20 text, clear/status on the right.
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

/// Sketch component `Tab/文字`; with `showLine` true it has a full-width divider and a selected indicator at the bottom (search page, plugin search page);
/// with false it shows only text and count (library top navigation).
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
                      child: CjkText(it.$1),
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

/// Now-playing waveform (matches macOS Dynamic Island): 18×18, four pill bars
/// stepping to new rhythmic heights every 160ms with easeInOut; stops the timer
/// when paused and settles to resting dots (or a static silhouette via [rest]).
class PlayingBars extends StatefulWidget {
  const PlayingBars({
    super.key,
    required this.playing,
    this.color,
    this.rest = 0,
  });
  final bool playing;
  final Color? color;

  /// Bar height when paused (0–1). 0 is a few dots; it still has to read as an indicator when stopped on the home station card.
  final double rest;

  @override
  State<PlayingBars> createState() => _PlayingBarsState();
}

class _PlayingBarsState extends State<PlayingBars>
    with SingleTickerProviderStateMixin {
  static const _bars = 4;
  static const _step = Duration(milliseconds: 160);
  static const _settle = Duration(milliseconds: 220);

  late final _c = AnimationController(vsync: this, duration: _step);
  Timer? _timer;
  int _tick = 0;
  late List<double> _from = _target(widget.playing, 0);
  late List<double> _to = List<double>.of(_from);

  static double _waveLevel(int i, int tick) {
    final a = math.sin(tick * 1.7 + i * 2.1);
    final b = math.sin(tick * 0.9 + i * 1.3);
    return 0.28 + 0.72 * (a * 0.6 + b * 0.4).abs();
  }

  List<double> _target(bool playing, int tick) => List.generate(_bars, (i) {
    if (playing) return _waveLevel(i, tick);
    if (widget.rest > 0) return _waveLevel(i, 1) * widget.rest;
    return 0;
  });

  List<double> _current() {
    final t = Curves.easeInOut.transform(_c.value);
    return List.generate(_bars, (i) => _from[i] + (_to[i] - _from[i]) * t);
  }

  void _advance() {
    _tick++;
    _from = _current();
    _to = _target(true, _tick);
    _c
      ..duration = _step
      ..forward(from: 0);
  }

  void _start() {
    _timer?.cancel();
    _advance();
    _timer = Timer.periodic(_step, (_) => _advance());
  }

  void _stop() {
    _timer?.cancel();
    _timer = null;
    _from = _current();
    _to = _target(false, _tick);
    _c
      ..duration = _settle
      ..forward(from: 0);
  }

  @override
  void initState() {
    super.initState();
    if (widget.playing) {
      _start();
    } else {
      _c.value = 1;
    }
  }

  @override
  void didUpdateWidget(PlayingBars old) {
    super.didUpdateWidget(old);
    if (widget.playing != old.playing) {
      widget.playing ? _start() : _stop();
    } else if (!widget.playing && widget.rest != old.rest) {
      _stop();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, _) => CustomPaint(
        size: const Size(18, 18),
        painter: _BarsPainter(_current(), widget.color ?? accent),
      ),
    );
  }
}

class _BarsPainter extends CustomPainter {
  _BarsPainter(this.levels, this.color);
  final List<double> levels;
  final Color color;

  static const _barW = 2.5;
  static const _gap = 2.0;
  static const _maxH = 16.0;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color;
    final totalW = levels.length * _barW + (levels.length - 1) * _gap;
    final startX = (size.width - totalW) / 2;
    const radius = Radius.circular(_barW / 2);
    for (var i = 0; i < levels.length; i++) {
      final h = math.max(_barW, _maxH * levels[i]);
      final x = startX + i * (_barW + _gap);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, (size.height - h) / 2, _barW, h),
          radius,
        ),
        p,
      );
    }
  }

  @override
  bool shouldRepaint(_BarsPainter o) {
    if (o.color != color || o.levels.length != levels.length) return true;
    for (var i = 0; i < levels.length; i++) {
      if (o.levels[i] != levels[i]) return true;
    }
    return false;
  }
}

// ───────────── Common dialog (Sketch component comparison "通用弹窗 · 定稿") ─────────────
// Width 400, padding 32, radius 28. A 64 icon circle on top, then the centered title (20),
// description (14, line height 22), optional content (input field), and finally two equal-width L buttons:
// cancel on the left, confirm on the right. For dangerous actions the icon circle and button are red. Esc cancels, Enter confirms.

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
                        CjkText(
                          title,
                          textAlign: TextAlign.center,
                          style: ts(20, w: w700),
                        ),
                        if (message != null) ...[
                          const SizedBox(height: 10),
                          CjkText(
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

/// Confirmation dialog: confirm returns true, cancel (button, Esc, clicking outside) returns false.
/// Use [danger] for actions like delete or sign out. [message] can use \n for manual line breaks.
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

/// Dialog asking the user for a name (e.g. new playlist). Cancel returns null; the name is trimmed,
/// and empty names can't be submitted. Below the input is a left-aligned [hint], with the character count on the right.
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
  // The dialog's outer layer needs focus too (for Esc); the input field must request it after that
  WidgetsBinding.instance.addPostFrameCallback((_) => focus.requestFocus());
  return done.future;
}

/// Asks before signing out of a source's account. Returns true if signed out.
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
