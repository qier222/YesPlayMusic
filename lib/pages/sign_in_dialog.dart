// Plugin sign-in window: the plugin provides a QR code and instructions via host.signInPrompt, shown here
// until sign-in finishes or the user cancels.

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../l10n/l10n.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';

class SignInPromptLayer extends StatelessWidget {
  const SignInPromptLayer({super.key});

  @override
  Widget build(BuildContext context) {
    final prompt = context.app.signInPrompt;
    if (prompt == null) return const SizedBox.shrink();
    final close = context.appRead.cancelSignIn;
    return Shortcuts(
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
                  onTap: () {},
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
                  child: _card(context.l10n, prompt, close),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _card(AppLocalizations l, SignInPrompt prompt, VoidCallback close) =>
      Container(
        width: 380,
        padding: const EdgeInsets.all(32),
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
          children: [
            Row(
              children: [
                Expanded(
                  child: tx(
                    l.signInDialogTitle(prompt.name),
                    20,
                    w: w700,
                    f: F.semi,
                  ),
                ),
                IconBtn(
                  'close',
                  size: BtnSize.s,
                  tip: l.actionCancel,
                  onTap: close,
                ),
              ],
            ),
            if (prompt.qr.isNotEmpty) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: squircle(16, color: const Color(0xFFFFFFFF)),
                child: QrImageView(
                  data: prompt.qr,
                  size: 200,
                  padding: EdgeInsets.zero,
                  backgroundColor: const Color(0xFFFFFFFF),
                  errorStateBuilder: (_, _) => SizedBox(
                    width: 200,
                    height: 200,
                    child: Center(child: tx(l.signInQrFailed, 13, c: P.faint)),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 20),
            tx(
              prompt.text.isEmpty ? l.stateSigningIn : prompt.text,
              14,
              w: w500,
              c: P.faint,
              lines: 3,
              align: TextAlign.center,
            ),
          ],
        ),
      );
}
