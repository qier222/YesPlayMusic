// The "Music source" menu popping up from the sidebar avatar (Sketch "插件设置" v2 option C).

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'plugin_ui.dart';
import 'settings.dart' show openPluginSettings;

OverlayEntry? _entry;

/// Pops up to the right of [anchor] (the avatar), bottom-aligned with it.
void showSourceSwitcher(BuildContext anchor) {
  _entry?.remove();
  final box = anchor.findRenderObject() as RenderBox;
  final at = box.localToGlobal(Offset.zero) & box.size;
  late final OverlayEntry self;
  void close() {
    if (!identical(_entry, self)) return;
    _entry = null;
    menuOwner.value = null;
    self.remove();
  }

  self = _entry = OverlayEntry(
    builder: (ctx) => Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (_) {
              close();
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
                  onTap: close,
                  onSecondaryTap: close,
                ),
              ),
              Positioned(
                left: at.right + 12,
                bottom: MediaQuery.sizeOf(ctx).height - at.bottom,
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 160),
                  curve: Curves.easeOutCubic,
                  builder: (_, t, c) => Opacity(
                    opacity: t,
                    child: Transform.translate(
                      offset: Offset(-6 * (1 - t), 0),
                      child: c,
                    ),
                  ),
                  child: _Panel(onClose: close),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  Overlay.of(anchor, rootOverlay: true).insert(self);
}

class _Panel extends StatelessWidget {
  const _Panel({required this.onClose});
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Container(
      width: 300,
      padding: const EdgeInsets.all(8),
      decoration: squircle(
        18,
        color: P.dark ? const Color(0xFF17171A) : white,
        side: BorderSide(color: P.dark ? wa(0.08) : ba(0.08)),
        shadows: [
          BoxShadow(
            color: ba(P.dark ? 0.5 : 0.18),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
            child: tx(context.l10n.sourceMusicSource, 13, w: w600, c: P.faint),
          ),
          for (final s in musicSources(app))
            _SourceRow(
              id: s.id,
              name: s.name,
              selected: app.sourceId == s.id,
              onTap: () {
                onClose();
                useSource(app, s.id, s.name);
              },
            ),
          Container(
            height: 1,
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            color: P.dark ? wa(0.08) : ba(0.08),
          ),
          _LinkRow(
            icon: 'plugin',
            label: context.l10n.actionManagePlugins,
            onTap: () {
              onClose();
              openPluginSettings(app);
            },
          ),
        ],
      ),
    );
  }
}

class _SourceRow extends StatelessWidget {
  const _SourceRow({
    required this.id,
    required this.name,
    required this.selected,
    required this.onTap,
  });
  final String id, name;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final line = sourceLine(context.app, id);
    return Tap(
      onTap: onTap,
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(
          12,
          color: selected || h ? (P.dark ? wa(0.06) : ba(0.05)) : null,
        ),
        child: Row(
          children: [
            SourceIcon(id: id, name: name, size: 32),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(name, 14, w: selected ? w600 : w500),
                  if (line.text.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    tx(line.text, 12, w: w500, c: line.color ?? P.faint),
                  ],
                ],
              ),
            ),
            if (selected) ...[
              const SizedBox(width: 8),
              Ico('check', size: 16, color: accent),
            ],
          ],
        ),
      ),
    );
  }
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({
    required this.icon,
    required this.label,
    required this.onTap,
  });
  final String icon, label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, _) => AnimatedContainer(
      duration: fast,
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 18),
      decoration: squircle(
        10,
        color: h ? (P.dark ? wa(0.06) : ba(0.05)) : null,
      ),
      child: Row(
        children: [
          Ico(icon, size: 16, color: h ? P.ink : P.muted),
          const SizedBox(width: 12),
          tx(label, 13, w: w500, c: h ? P.ink : P.muted),
        ],
      ),
    ),
  );
}
