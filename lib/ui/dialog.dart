// Common widgets: text dialog.

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../theme.dart';
import 'buttons.dart';

// ───────────── Text dialog ─────────────

OverlayEntry? _dialogEntry;

/// A centered dialog card: title + close button + [body]. Dismissed by clicking outside, Esc or the close button.
/// Returns a close function; [onClose] is called on dismissal (however it was dismissed).
VoidCallback showDialogCard(
  BuildContext context, {
  required String title,
  required Widget Function(VoidCallback close) body,
  double width = 480,
  VoidCallback? onClose,
}) {
  _dialogEntry?.remove();
  OverlayEntry? self;
  void close() {
    if (self == null || _dialogEntry != self) return;
    _dialogEntry!.remove();
    _dialogEntry = null;
    onClose?.call();
  }

  self = _dialogEntry = OverlayEntry(
    builder: (_) => Shortcuts(
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
                  child: ColoredBox(color: ba(0.65)),
                ),
              ),
              Center(
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutCubic,
                  builder: (_, t, c) => Opacity(
                    opacity: t,
                    child: Transform.scale(scale: 0.96 + 0.04 * t, child: c),
                  ),
                  child: Container(
                    width: width,
                    constraints: const BoxConstraints(maxHeight: 560),
                    padding: const EdgeInsets.fromLTRB(32, 28, 32, 32),
                    decoration: squircle(
                      24,
                      color: P.dark ? const Color(0xFF1C1C1F) : P.floating,
                      side: BorderSide(color: P.dark ? wa(0.08) : ba(0.08)),
                      shadows: [
                        BoxShadow(
                          color: ba(P.dark ? 0.6 : 0.2),
                          blurRadius: 48,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: tx(title, 20, w: w700, f: F.semi),
                            ),
                            IconBtn(
                              'close',
                              size: BtnSize.s,
                              tip: context.l10n.actionClose,
                              onTap: close,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Flexible(child: body(close)),
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
  return close;
}

/// A dialog for reading a long text (e.g. a full playlist description).
void showTextDialog(BuildContext context, String title, String text) {
  showDialogCard(
    context,
    title: title,
    body: (_) => SingleChildScrollView(
      child: Text(
        text,
        style: ts(14, w: w500, c: P.muted, h: 24 / 14),
      ),
    ),
  );
}
