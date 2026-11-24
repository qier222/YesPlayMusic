// Common widgets: tags, badges, tabs, section titles.

import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../theme.dart';
import 'tap.dart';

/// Small tag (Sketch component Tag: 28 high, capsule, white 8%, hover white 20%), tappable.
/// Selected ones (sub-tabs) are black text on #F7F7F8.
class UiTag extends StatelessWidget {
  const UiTag(
    this.label, {
    super.key,
    required this.onTap,
    this.selected = false,
  });
  final String label;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, p) => PressScale(
      pressed: p,
      down: 0.95,
      child: AnimatedContainer(
        duration: fast,
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        // No alignment: setting it makes it fill the whole row inside Wrap
        decoration: squircle(
          14,
          color: selected
              ? P.ink
              : (P.dark ? wa(h ? 0.2 : 0.08) : ba(h ? 0.12 : 0.05)),
        ),
        child: Center(
          widthFactor: 1,
          child: tx(
            label,
            13,
            w: w700,
            f: F.semi,
            c: selected ? P.ground : null,
          ),
        ),
      ),
    ),
  );
}

/// Small badge (Sketch component Badge: 20 high, radius 6, padding 6; emphasis / normal).
class UiBadge extends StatelessWidget {
  const UiBadge(this.label, {super.key, this.accented = false});
  final String label;
  final bool accented;

  @override
  Widget build(BuildContext context) {
    final bg = accented ? accent : (P.dark ? wa(0.12) : ba(0.08));
    final fg = accented ? P.ground : (P.dark ? wa(0.8) : P.muted);
    return Container(
      height: 20,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      alignment: Alignment.center,
      decoration: squircle(6, color: bg),
      child: tx(label, 11, w: accented ? w700 : w600, c: fg),
    );
  }
}

/// Capsule tabs on a cover-color background (top of Now Playing and Coverflow; Sketch Tab / capsule spec).
class CoverPill extends StatelessWidget {
  const CoverPill({
    super.key,
    required this.label,
    this.count,
    required this.active,
    this.onTap,
    this.enabled = true,
  });
  final String label;
  final String? count;
  final bool active, enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Tap(
      onTap: enabled ? onTap : null,
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (_, h, p) => PressScale(
        pressed: p && enabled,
        down: 0.95,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          alignment: Alignment.center,
          decoration: squircle(
            20,
            color: active
                ? const Color(0xFFF7F7F8)
                : (p && enabled
                      ? wa(0.04)
                      : (h && enabled ? wa(0.12) : wa(0.08))),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              tx(
                label,
                14,
                w: w700,
                f: F.semi,
                c: active
                    ? darkInk
                    : (enabled ? const Color(0xFFF7F7F8) : wa(0.4)),
              ),
              if (count != null) ...[
                const SizedBox(width: 6),
                tx(
                  count!,
                  12,
                  w: w700,
                  c: active ? ba(0.5) : wa(enabled ? 0.5 : 0.25),
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

/// Underlined text toggle like "Title A–Z / Release date".
class TextTabs extends StatelessWidget {
  const TextTabs({
    super.key,
    required this.labels,
    required this.selected,
    required this.onChanged,
    this.gap = 20,
  });
  final List<String> labels;
  final int selected;
  final ValueChanged<int> onChanged;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < labels.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          Tap(
            onTap: () => onChanged(i),
            builder: (_, h, _) => IntrinsicWidth(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AnimatedDefaultTextStyle(
                    duration: fast,
                    style: ts(
                      13,
                      w: w700,
                      f: F.semi,
                      c: i == selected ? P.ink : (h ? P.muted : P.faint),
                    ),
                    child: CjkText(labels[i]),
                  ),
                  const SizedBox(height: 6),
                  AnimatedOpacity(
                    duration: const Duration(milliseconds: 150),
                    opacity: i == selected ? 1 : 0,
                    child: Container(
                      height: 2,
                      decoration: squircle(1, color: P.ink),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Section title + "All" on the right.
class SectionTitle extends StatelessWidget {
  const SectionTitle(
    this.title, {
    super.key,
    this.onAll,
    this.allLabel,
    this.count,
  });
  final String title;
  final String? count;
  final VoidCallback? onAll;
  final String? allLabel;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 28,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          tx(title, 20, w: w700, f: F.semi),
          if (count != null) ...[
            const SizedBox(width: 8),
            tx(count!, 14, w: w700, c: P.faint),
          ],
          const Spacer(),
          if (onAll != null)
            Tap(
              onTap: onAll,
              builder: (_, h, _) => AnimatedDefaultTextStyle(
                duration: fast,
                style: ts(14, w: w700, f: F.semi, c: h ? P.ink : P.muted),
                child: CjkText(allLabel ?? context.l10n.actionAll),
              ),
            ),
        ],
      ),
    );
  }
}
