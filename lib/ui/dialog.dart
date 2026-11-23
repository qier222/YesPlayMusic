// 通用组件：文字弹窗。

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../theme.dart';
import 'buttons.dart';

// ───────────── 文字弹窗 ─────────────

OverlayEntry? _dialogEntry;

/// 居中的弹窗卡片：标题 + 关闭按钮 + [body]。点外面、按 Esc 或关闭按钮收起。
/// 返回关闭函数；[onClose] 在收起时调用（不管怎么收起的）。
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

/// 弹窗看一段长文字（歌单说明全文这类）。
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
