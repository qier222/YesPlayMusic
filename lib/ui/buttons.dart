// Common widgets: buttons.

import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../theme.dart';
import 'icons.dart';
import 'tap.dart';

// ───────────── Buttons (Sketch component spec: L 48 / M 40 / S 32 × primary / secondary) ─────────────

enum BtnSize {
  l(48, 18, 20, 8, 14),
  m(40, 18, 20, 8, 14),
  s(32, 12, 16, 6, 13);

  const BtnSize(this.height, this.padH, this.icon, this.gap, this.font);
  final double height, padH, icon, gap, font;

  static BtnSize fromHeight(double h) {
    if (h >= 46) return BtnSize.l;
    if (h <= 34) return BtnSize.s;
    return BtnSize.m;
  }
}

/// danger: irreversible actions like delete or sign out, white text on red.
enum BtnKind { primary, secondary, danger }

({Color bg, Color hover, Color press, Color fg}) _btnColors(
  BtnKind kind, {
  bool onCover = false,
  bool onLightCover = false,
}) {
  final darkSurface = onCover ? !onLightCover : P.dark;
  if (kind == BtnKind.danger) {
    return (
      bg: const Color(0xFFE5484D),
      hover: const Color(0xFFEC5D62),
      press: const Color(0xFFCE3F44),
      fg: white,
    );
  }
  if (kind == BtnKind.primary) {
    if (darkSurface) {
      return (
        bg: const Color(0xFFF7F7F8),
        hover: white,
        press: const Color(0xFFE4E4E7),
        fg: darkInk,
      );
    }
    return (
      bg: darkInk,
      hover: const Color(0xFF242428),
      press: const Color(0xFF303036),
      fg: white,
    );
  }
  // Secondary buttons: white 8% on dark/cover backgrounds (hover 12%, pressed 4%), black 6% on light backgrounds (hover 10%, pressed 4%).
  if (darkSurface) {
    return (
      bg: wa(0.08),
      hover: wa(0.12),
      press: wa(0.04),
      fg: const Color(0xFFF7F7F8),
    );
  }
  return (
    bg: ba(onLightCover ? 0.08 : 0.06),
    hover: ba(onLightCover ? 0.12 : 0.10),
    press: ba(0.04),
    fg: darkInk,
  );
}

/// Standard capsule button (L 48 / M 40 / S 32 × primary / secondary, text or icon + text).
class Btn extends StatelessWidget {
  const Btn({
    super.key,
    required this.label,
    this.icon,
    this.iconWidget,
    this.size = BtnSize.m,
    this.kind = BtnKind.secondary,
    this.onTap,
    this.enabled = true,
    this.onCover = false,
    this.onLightCover = false,
    this.tip,
    this.tipOnCover = false,
    this.expand = false,
  });

  /// Fills the given width (two equal-width buttons in a dialog), content centered.
  final bool expand;
  final String label;
  final String? icon;
  final Widget? iconWidget;
  final BtnSize size;
  final BtnKind kind;
  final VoidCallback? onTap;
  final bool enabled, onCover, onLightCover, tipOnCover;
  final String? tip;

  @override
  Widget build(BuildContext context) {
    final active = enabled && onTap != null;
    final c = _btnColors(kind, onCover: onCover, onLightCover: onLightCover);
    Widget w = Tap(
      onTap: active ? onTap : null,
      cursor: active ? SystemMouseCursors.click : SystemMouseCursors.basic,
      tip: tip,
      tipOnCover: tipOnCover || onCover,
      builder: (_, h, p) => PressScale(
        pressed: p && active,
        down: 0.95,
        child: AnimatedContainer(
          duration: fast,
          height: size.height,
          padding: EdgeInsets.symmetric(horizontal: size.padH),
          decoration: squircle(
            size.height / 2,
            color: active ? (p ? c.press : (h ? c.hover : c.bg)) : c.bg,
          ),
          child: Row(
            mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (iconWidget != null) ...[
                iconWidget!,
                SizedBox(width: size.gap),
              ] else if (icon != null) ...[
                Ico(icon!, size: size.icon, color: c.fg),
                SizedBox(width: size.gap),
              ],
              tx(label, size.font, w: w700, c: c.fg, f: F.semi),
            ],
          ),
        ),
      ),
    );
    if (!enabled) w = Opacity(opacity: 0.4, child: w);
    return w;
  }
}

/// Standard round icon button (L 48 / M 40 / S 32 × primary / secondary, icons L 20 / M 18 / S 16).
class IconBtn extends StatelessWidget {
  const IconBtn(
    this.icon, {
    super.key,
    this.size = BtnSize.m,
    this.kind = BtnKind.secondary,
    this.onTap,
    this.enabled = true,
    this.onCover = false,
    this.onLightCover = false,
    this.fg,
    this.tip,
    this.tipOnCover = false,
  });

  final String icon;
  final BtnSize size;
  final BtnKind kind;
  final VoidCallback? onTap;
  final bool enabled, onCover, onLightCover, tipOnCover;
  final Color? fg;
  final String? tip;

  /// Directional triangle icons look off-center when geometrically centered in a round button, so they're nudged to center visually.
  static double _opticalDx(String icon) => switch (icon) {
    'next' => 1.5,
    'previous' => -1.5,
    _ => 0,
  };

  @override
  Widget build(BuildContext context) {
    final active = enabled && onTap != null;
    final c = _btnColors(kind, onCover: onCover, onLightCover: onLightCover);
    final dx = _opticalDx(icon);
    Widget ico = Ico(icon, size: size.icon, color: fg ?? c.fg);
    if (dx != 0) ico = Transform.translate(offset: Offset(dx, 0), child: ico);
    Widget w = Tap(
      onTap: active ? onTap : null,
      cursor: active ? SystemMouseCursors.click : SystemMouseCursors.basic,
      tip: tip,
      tipOnCover: tipOnCover || onCover,
      builder: (_, h, p) => PressScale(
        pressed: p && active,
        child: AnimatedContainer(
          duration: fast,
          width: size.height,
          height: size.height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? (p ? c.press : (h ? c.hover : c.bg)) : c.bg,
            shape: BoxShape.circle,
          ),
          child: ico,
        ),
      ),
    );
    if (!enabled) w = Opacity(opacity: 0.4, child: w);
    return w;
  }
}

/// Round icon button (keeps the old name; rendered per the Icon Button spec internally).
class CircleBtn extends StatelessWidget {
  const CircleBtn(
    this.icon, {
    super.key,
    this.onTap,
    this.size = 40,
    this.iconSize,
    this.bg,
    this.fg,
    this.hoverBg,
    this.tip,
    this.tipOnCover = false,
    this.onCover = false,
    this.onLightCover = false,
  });
  final String icon;
  final VoidCallback? onTap;
  final double size;
  final double? iconSize;
  final Color? bg, fg, hoverBg;
  final String? tip;
  final bool tipOnCover, onCover, onLightCover;

  @override
  Widget build(BuildContext context) {
    if (bg == null && hoverBg == null && iconSize == null) {
      return IconBtn(
        icon,
        size: BtnSize.fromHeight(size),
        onTap: onTap,
        fg: fg,
        tip: tip,
        tipOnCover: tipOnCover,
        onCover: onCover || tipOnCover,
        onLightCover: onLightCover,
      );
    }
    final spec = BtnSize.fromHeight(size);
    final c = _btnColors(
      BtnKind.secondary,
      onCover: onCover || tipOnCover,
      onLightCover: onLightCover,
    );
    final base = bg ?? c.bg;
    return Tap(
      onTap: onTap,
      tip: tip,
      tipOnCover: tipOnCover,
      builder: (_, h, p) => PressScale(
        pressed: p,
        child: AnimatedContainer(
          duration: fast,
          width: spec.height,
          height: spec.height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: p ? c.press : (h ? (hoverBg ?? c.hover) : base),
            shape: BoxShape.circle,
          ),
          child: Ico(icon, size: iconSize ?? spec.icon, color: fg ?? c.fg),
        ),
      ),
    );
  }
}

class BackBtn extends StatelessWidget {
  const BackBtn({super.key, required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => IconBtn(
    'chevron-left',
    size: BtnSize.m,
    onTap: onTap,
    tip: context.l10n.actionBack,
  );
}

/// Primary button: the spec's Primary capsule "▶ Play".
class PlayPill extends StatelessWidget {
  const PlayPill({
    super.key,
    this.label,
    this.height = 48,
    this.onTap,
    this.icon = 'play',
    this.onCover = false,
  });
  final String? label;
  final String icon;
  final double height;
  final VoidCallback? onTap;
  final bool onCover;

  @override
  Widget build(BuildContext context) => Btn(
    label: label ?? context.l10n.actionPlay,
    icon: icon,
    size: BtnSize.fromHeight(height),
    kind: BtnKind.primary,
    onTap: onTap,
    onCover: onCover,
  );
}

/// Secondary button: the spec's Secondary capsule, optionally with an icon.
class SoftPill extends StatelessWidget {
  const SoftPill({
    super.key,
    required this.label,
    this.icon,
    this.height = 40,
    this.onTap,
    this.onCover = false,
    this.tip,
  });
  final String label;
  final String? icon;
  final double height;
  final VoidCallback? onTap;
  final bool onCover;
  final String? tip;

  @override
  Widget build(BuildContext context) => Btn(
    label: label,
    icon: icon,
    size: BtnSize.fromHeight(height),
    kind: BtnKind.secondary,
    onTap: onTap,
    onCover: onCover,
    tip: tip,
  );
}

/// Top category pill: label + count; white background when selected.
class CountPill extends StatelessWidget {
  const CountPill({
    super.key,
    required this.label,
    this.count,
    required this.active,
    required this.onTap,
    this.bg,
  });
  final String label;
  final String? count;
  final bool active;
  final VoidCallback onTap;
  final Color? bg;

  @override
  Widget build(BuildContext context) {
    final c = _btnColors(BtnKind.secondary);
    return Tap(
      onTap: onTap,
      builder: (_, h, p) => PressScale(
        pressed: p,
        down: 0.95,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: squircle(
            20,
            color: active ? P.ink : (h ? c.hover : (bg ?? c.bg)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              tx(label, 14, w: w700, c: active ? P.ground : P.ink, f: F.semi),
              if (count != null) ...[
                const SizedBox(width: 6),
                tx(
                  count!,
                  12,
                  w: w700,
                  c: active ? P.ground.withValues(alpha: 0.5) : P.faint,
                  tnum: true,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
