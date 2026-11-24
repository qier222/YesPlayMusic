// Comments on the Now Playing page (final · Now Playing · Comments): every comment the same size, with avatar, name,
// time, body, likes and reply; a reply is a normal comment quoting the one it replies to under the body.
// Writing a comment or reply opens a full-screen input layer (immersive large text).

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../comments.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../state.dart';
import '../shell.dart' show DragWindow;
import '../theme.dart';
import '../ui.dart';
import 'home_sections.dart' show playsText;

String _err(Object e, String fallback) =>
    e is SourceError && e.reason.isNotEmpty ? e.reason : fallback;

/// 3 days ago, May 12 (this year), Jan 3, 2024.
String commentTime(int ms, AppLocalizations l) {
  if (ms <= 0) return '';
  final t = DateTime.fromMillisecondsSinceEpoch(ms);
  final d = DateTime.now().difference(t);
  if (d.inMinutes < 1) return l.timeJustNow;
  if (d.inHours < 1) return l.timeMinutesAgo(d.inMinutes);
  if (d.inDays < 1) return l.timeHoursAgo(d.inHours);
  if (d.inDays < 30) return l.timeDaysAgo(d.inDays);
  return t.year == DateTime.now().year
      ? l.dateMonthDay(t.month, t.day)
      : l.dateYearMonthDay(t.year, t.month, t.day);
}

class CommentsPanel extends StatefulWidget {
  const CommentsPanel({super.key, required this.track});
  final Track track;

  @override
  State<CommentsPanel> createState() => _CommentsPanelState();
}

class _CommentsPanelState extends State<CommentsPanel> {
  CommentSort _sort = CommentSort.hot;

  @override
  Widget build(BuildContext context) {
    final feed = context.app.commentsOf(widget.track, _sort);
    if (feed == null) return const SizedBox.shrink();
    return ListenableBuilder(
      listenable: feed,
      builder: (context, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 760,
            height: 32,
            child: Row(
              children: [
                for (final s in CommentSort.values) ...[
                  _SortTab(
                    label: s == CommentSort.hot
                        ? context.l10n.commentSortHot
                        : context.l10n.commentSortLatest,
                    active: s == _sort,
                    onTap: () => setState(() => _sort = s),
                  ),
                  const SizedBox(width: 16),
                ],
                const Spacer(),
                if (feed.total > 0)
                  tx(
                    context.l10n.countComments(playsText(feed.total)),
                    13,
                    c: wa(0.5),
                  ),
                if (feed.canPost) ...[
                  const SizedBox(width: 16),
                  Btn(
                    label: context.l10n.commentWrite,
                    icon: 'edit',
                    size: BtnSize.s,
                    onCover: true,
                    onTap: () => openComposer(context, widget.track, feed),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          Expanded(child: _list(feed)),
        ],
      ),
    );
  }

  Widget _list(CommentFeed feed) {
    final l = context.l10n;
    if (feed.items.isEmpty) {
      final s = feed.loading || feed.more
          ? l.stateLoading
          : feed.error ?? l.commentEmpty;
      return Padding(
        padding: const EdgeInsets.only(top: 12),
        child: tx(s, 15, w: w600, c: wa(0.5)),
      );
    }
    return ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (r) => LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [black, black, ba(0)],
        stops: const [0, 0.85, 1],
      ).createShader(r),
      child: ScrollConfiguration(
        behavior: const NoBars(),
        child: NotificationListener<ScrollNotification>(
          onNotification: (n) {
            if (n.metrics.extentAfter < 400) feed.loadMore();
            return false;
          },
          child: ListView.builder(
            padding: const EdgeInsets.only(bottom: 80),
            itemCount: feed.items.length + (feed.more ? 1 : 0),
            itemBuilder: (context, i) {
              if (i == feed.items.length) {
                // Keep fetching even when the list is too short to scroll
                scheduleMicrotask(feed.loadMore);
                return Padding(
                  padding: const EdgeInsets.only(left: 44, top: 4),
                  child: tx(l.stateLoading, 13, c: wa(0.45)),
                );
              }
              final c = feed.items[i];
              return FadeIn(
                key: ValueKey(c.id),
                delay: math.min(i, 8) * 30,
                child: _CommentRow(
                  comment: c,
                  onLike: feed.canLike ? () => _like(feed, c) : null,
                  onReply: feed.canPost
                      ? () => openComposer(
                          context,
                          widget.track,
                          feed,
                          replyTo: c,
                        )
                      : null,
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _like(CommentFeed feed, m.Comment c) async {
    try {
      await feed.like(c);
    } catch (e) {
      showToast(_err(e, L.commentLikeFailed));
    }
  }
}

class _SortTab extends StatelessWidget {
  const _SortTab({
    required this.label,
    required this.active,
    required this.onTap,
  });
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, _) => AnimatedDefaultTextStyle(
      duration: fast,
      style: ts(14, w: w700, c: wa(active ? 1 : (h ? 0.75 : 0.5))),
      child: CjkText(label),
    ),
  );
}

/// Commenter avatar: the image if the source gives one, otherwise the first character of the name.
class _Avatar extends StatelessWidget {
  const _Avatar({required this.name, required this.url, this.size = 32});
  final String name, url;
  final double size;

  @override
  Widget build(BuildContext context) {
    if (url.isNotEmpty) return Cover(url, w: size, h: size, r: size / 2);
    final first = name.isEmpty ? '?' : String.fromCharCode(name.runes.first);
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: wa(0.14), shape: BoxShape.circle),
      child: tx(first.toUpperCase(), size * 0.42, w: w700, c: wa(0.85)),
    );
  }
}

/// The comment being replied to: a vertical line on the left, "@name:" followed by the body, at most two lines.
class _Quote extends StatelessWidget {
  const _Quote(this.q, {this.size = 13});
  final m.CommentQuote q;
  final double size;

  @override
  Widget build(BuildContext context) => IntrinsicHeight(
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(width: 2, decoration: squircle(1, color: wa(0.2))),
        const SizedBox(width: 10),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: CjkText.rich(
              TextSpan(
                children: [
                  if (q.userName.isNotEmpty)
                    TextSpan(
                      text: '@${q.userName}：',
                      style: ts(size, w: w700, c: wa(0.6)),
                    ),
                  TextSpan(text: q.text),
                ],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: ts(size, w: w500, c: wa(0.6), h: 1.5),
            ),
          ),
        ),
      ],
    ),
  );
}

class _CommentRow extends StatelessWidget {
  const _CommentRow({required this.comment, this.onLike, this.onReply});
  final m.Comment comment;
  final VoidCallback? onLike, onReply;

  @override
  Widget build(BuildContext context) {
    final c = comment;
    final likeColor = c.liked ? accent : wa(0.55);
    return SizedBox(
      width: 760,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 28),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Avatar(name: c.userName, url: c.userImageUrl),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(
                    c.userName.isEmpty
                        ? context.l10n.commentAnonymous
                        : c.userName,
                    13,
                    w: w700,
                    c: white,
                  ),
                  const SizedBox(height: 4),
                  CjkText(
                    c.text,
                    style: ts(14, w: w500, c: wa(0.85), h: 1.57),
                  ),
                  if (c.replyTo != null) ...[
                    const SizedBox(height: 8),
                    _Quote(c.replyTo!),
                  ],
                  const SizedBox(height: 8),
                  // Time at the bottom left, likes and reply at the bottom right
                  Row(
                    children: [
                      tx(
                        commentTime(c.time, context.l10n),
                        12,
                        w: w500,
                        c: wa(0.45),
                      ),
                      const Spacer(),
                      Tap(
                        onTap: onLike,
                        cursor: onLike == null
                            ? MouseCursor.defer
                            : SystemMouseCursors.click,
                        builder: (_, h, _) => Opacity(
                          opacity: h && onLike != null ? 1 : 0.9,
                          child: Row(
                            children: [
                              Ico('thumbs-up', size: 16, color: likeColor),
                              if (c.likes > 0) ...[
                                const SizedBox(width: 6),
                                tx(
                                  playsText(c.likes),
                                  12,
                                  w: w600,
                                  c: likeColor,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      if (onReply != null) ...[
                        const SizedBox(width: 20),
                        Tap(
                          onTap: onReply,
                          builder: (_, h, _) => tx(
                            context.l10n.commentReply,
                            12,
                            w: w600,
                            c: wa(h ? 0.85 : 0.55),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ───── Input layer ─────

/// Opens the full-screen input layer for writing a comment ([replyTo] empty) or a reply.
void openComposer(
  BuildContext context,
  Track track,
  CommentFeed feed, {
  m.Comment? replyTo,
}) {
  late final OverlayEntry entry;
  entry = OverlayEntry(
    builder: (_) => _Composer(
      track: track,
      feed: feed,
      replyTo: replyTo,
      onClose: () => entry.remove(),
    ),
  );
  Overlay.of(context, rootOverlay: true).insert(entry);
}

class _Composer extends StatefulWidget {
  const _Composer({
    required this.track,
    required this.feed,
    required this.replyTo,
    required this.onClose,
  });
  final Track track;
  final CommentFeed feed;
  final m.Comment? replyTo;
  final VoidCallback onClose;

  @override
  State<_Composer> createState() => _ComposerState();
}

class _ComposerState extends State<_Composer>
    with SingleTickerProviderStateMixin {
  final _text = TextEditingController();
  final _focus = FocusNode();
  late final _anim = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 200),
  )..forward();
  bool _sending = false, _closing = false;

  @override
  void dispose() {
    _text.dispose();
    _focus.dispose();
    _anim.dispose();
    super.dispose();
  }

  Future<void> _close() async {
    if (_closing) return;
    _closing = true;
    await _anim.reverse();
    widget.onClose();
  }

  bool get _ready => _text.text.trim().isNotEmpty && !_sending;

  Future<void> _send() async {
    if (!_ready) return;
    setState(() => _sending = true);
    try {
      await widget.feed.post(_text.text.trim(), replyTo: widget.replyTo);
      showToast(
        widget.replyTo == null ? L.commentPosted : L.commentReplyPosted,
      );
      await _close();
    } catch (e) {
      showToast(_err(e, L.commentPostFailed));
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.replyTo;
    final t = widget.track;
    return Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
        SingleActivator(LogicalKeyboardKey.enter, meta: true): ActivateIntent(),
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (_) => _close(),
          ),
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) => _send(),
          ),
        },
        child: FadeTransition(
          opacity: CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic),
          child: Stack(
            children: [
              Positioned.fill(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => _focus.requestFocus(),
                  child: const ColoredBox(color: Color(0xF20B0B0D)),
                ),
              ),
              const Positioned(
                left: 0,
                right: 0,
                top: 0,
                height: 72,
                child: DragWindow(),
              ),
              Positioned(
                left: 120,
                right: 120,
                top: 152,
                bottom: 168,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (r == null)
                          Cover(t.cover, w: 56, h: 56, r: 8)
                        else
                          _Avatar(
                            name: r.userName,
                            url: r.userImageUrl,
                            size: 56,
                          ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              tx(
                                r == null
                                    ? context.l10n.commentWriteTo
                                    : context.l10n.commentReply,
                                13,
                                w: w600,
                                c: wa(0.6),
                              ),
                              const SizedBox(height: 4),
                              tx(
                                r == null ? t.title : r.userName,
                                22,
                                w: w700,
                                f: F.wide,
                                c: white,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (r != null) ...[
                      const SizedBox(height: 20),
                      SizedBox(
                        width: 900,
                        child: _Quote(
                          m.CommentQuote(userName: r.userName, text: r.text),
                          size: 15,
                        ),
                      ),
                    ],
                    const SizedBox(height: 40),
                    Expanded(child: SizedBox(width: 900, child: _field(r))),
                  ],
                ),
              ),
              Positioned(
                left: 120,
                right: 120,
                bottom: 168,
                height: 48,
                child: ListenableBuilder(
                  listenable: _text,
                  builder: (_, _) => Row(
                    children: [
                      tx(
                        '${_text.text.characters.length} / $commentLimit',
                        13,
                        w: w600,
                        c: wa(0.6),
                      ),
                      const Spacer(),
                      Btn(
                        label: context.l10n.actionCancel,
                        size: BtnSize.l,
                        onCover: true,
                        onTap: _close,
                      ),
                      const SizedBox(width: 8),
                      Btn(
                        label: _sending
                            ? context.l10n.commentPosting
                            : (r == null
                                  ? context.l10n.commentPost
                                  : context.l10n.commentReply),
                        size: BtnSize.l,
                        kind: BtnKind.primary,
                        enabled: _ready,
                        onTap: _send,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(m.Comment? r) {
    final style = ts(30, w: w700, c: white, h: 1.5);
    return Stack(
      children: [
        ListenableBuilder(
          listenable: _text,
          builder: (_, _) => _text.text.isEmpty
              ? IgnorePointer(
                  child: CjkText(
                    r == null
                        ? context.l10n.commentPlaceholder
                        : context.l10n.commentReplyPlaceholder(r.userName),
                    style: style.copyWith(color: wa(0.3)),
                  ),
                )
              : const SizedBox.shrink(),
        ),
        ScrollConfiguration(
          behavior: const NoBars(),
          child: EditableText(
            controller: _text,
            focusNode: _focus,
            autofocus: true,
            style: style,
            cursorColor: accent,
            backgroundCursorColor: wa(0.3),
            selectionColor: accent.withValues(alpha: 0.35),
            cursorWidth: 3,
            cursorRadius: const Radius.circular(1.5),
            maxLines: null,
            keyboardType: TextInputType.multiline,
            inputFormatters: [LengthLimitingTextInputFormatter(commentLimit)],
          ),
        ),
      ],
    );
  }
}
