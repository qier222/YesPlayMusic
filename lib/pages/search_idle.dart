import 'package:flutter/widgets.dart';

import '../data.dart';
import '../l10n/l10n.dart';
import '../music/models.dart' as m;
import '../state.dart';
import '../theme.dart';
import '../ui.dart';

/// Content while the search box is empty (final "搜索 · 未输入", two variants):
/// with history, recent searches and recent results, plus trending search tags;
/// without history, only the trending search chart. That block is hidden if the source gives no trending searches.
class SearchIdle extends StatelessWidget {
  const SearchIdle({super.key, required this.source, required this.onWord});
  final String source;

  /// A term was tapped: fill it into the search box and search.
  final ValueChanged<String> onWord;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final words = app.searchQueries;
    final hits = app.searchHits;
    final history = words.isNotEmpty || hits.isNotEmpty;
    return FutureBuilder<List<m.HotSearch>>(
      future: app.hotSearches(source),
      builder: (context, snap) {
        final hot = snap.data ?? const <m.HotSearch>[];
        return SingleChildScrollView(
          padding: const EdgeInsets.only(top: 40, bottom: 200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (words.isNotEmpty) ...[
                _Title(
                  context.l10n.searchRecent,
                  action: context.l10n.actionClearShort,
                  onAction: app.clearSearchQueries,
                ),
                const SizedBox(height: 14),
                _Tags([for (final w in words) w], onWord),
                const SizedBox(height: 36),
              ],
              if (hits.isNotEmpty) ...[
                _Title(context.l10n.searchRecentResults),
                const SizedBox(height: 10),
                _Hits(hits),
                const SizedBox(height: 32),
              ],
              if (hot.isNotEmpty) ...[
                _Title(context.l10n.searchHot),
                const SizedBox(height: 14),
                if (history)
                  _Tags([for (final h in hot.take(10)) h.word], onWord)
                else
                  _HotList(hot.take(10).toList(), onWord),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _Title extends StatelessWidget {
  const _Title(this.title, {this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 28,
    child: Row(
      children: [
        tx(title, 18, w: w700, f: F.semi),
        const Spacer(),
        if (action != null)
          Tap(
            onTap: onAction,
            builder: (_, h, _) =>
                tx(action!, 13, w: w700, f: F.semi, c: h ? P.ink : P.muted),
          ),
      ],
    ),
  );
}

class _Tags extends StatelessWidget {
  const _Tags(this.words, this.onWord);
  final List<String> words;
  final ValueChanged<String> onWord;

  @override
  Widget build(BuildContext context) => Wrap(
    spacing: 8,
    runSpacing: 8,
    children: [for (final w in words) UiTag(w, onTap: () => onWord(w))],
  );
}

/// Two columns: fill the left column first, then the right.
class _Columns extends StatelessWidget {
  const _Columns(this.children);
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final per = (children.length + 1) ~/ 2;
    // The row's hover background extends 8 beyond the text on each side
    return LayoutBuilder(
      builder: (context, c) => Transform.translate(
        offset: const Offset(-8, 0),
        child: OverflowBox(
          alignment: Alignment.topLeft,
          minWidth: c.maxWidth + 16,
          maxWidth: c.maxWidth + 16,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (var col = 0; col < 2; col++) ...[
                if (col > 0) const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    children: children.skip(col * per).take(per).toList(),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Hits extends StatelessWidget {
  const _Hits(this.hits);
  final List<SearchHit> hits;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final kinds = {
      'track': l.tabSongs,
      'album': l.tabAlbums,
      'artist': l.tabArtistSearch,
      'playlist': l.tabPlaylists,
    };
    return _Columns([for (final h in hits) _HitRow(h, kinds[h.kind] ?? '')]);
  }
}

class _HitRow extends StatelessWidget {
  const _HitRow(this.h, this.kind);
  final SearchHit h;
  final String kind;

  void _open(AppState app) {
    app.rememberHit(h);
    final t = h.track;
    if (t != null) return app.playTrack(Track.of(t));
    app.go(AppState.remoteRoute(h.kind, h.source, h.id));
  }

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final round = h.kind == 'artist';
    return Tap(
      onTap: () => _open(app),
      builder: (_, hover, _) => AnimatedContainer(
        duration: fast,
        height: 60,
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: squircle(
          12,
          color: hover ? P.surface : P.surface.withValues(alpha: 0),
        ),
        child: Row(
          children: [
            h.cover.isEmpty
                ? Container(
                    width: 44,
                    height: 44,
                    alignment: Alignment.center,
                    decoration: squircle(round ? 22 : 8, color: P.raised),
                    child: Ico(
                      round ? 'user' : 'music',
                      size: 16,
                      color: P.faint,
                    ),
                  )
                : Cover(h.cover, w: 44, h: 44, r: round ? 22 : 8),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(h.title, 15, w: w700, f: F.semi),
                  if (h.sub.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    tx(h.sub, 13, w: w500, c: P.muted),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),
            if (kind.isNotEmpty) UiBadge(kind),
            if (hover)
              Tap(
                tip: context.l10n.searchRemoveHistory,
                onTap: () => app.forgetHit(h),
                builder: (_, x, _) => Padding(
                  padding: const EdgeInsets.only(left: 12),
                  child: Ico('close', size: 16, color: x ? P.ink : P.muted),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Trending searches when there's no history: a two-column chart with the top three indices in white.
class _HotList extends StatelessWidget {
  const _HotList(this.hot, this.onWord);
  final List<m.HotSearch> hot;
  final ValueChanged<String> onWord;

  @override
  Widget build(BuildContext context) => _Columns([
    for (final (i, h) in hot.indexed)
      Tap(
        onTap: () => onWord(h.word),
        builder: (_, hover, _) => AnimatedContainer(
          duration: fast,
          height: 56,
          margin: const EdgeInsets.only(bottom: 4),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: squircle(
            12,
            color: hover ? P.surface : P.surface.withValues(alpha: 0),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 36,
                child: Center(
                  child: tx(
                    '${i + 1}',
                    13,
                    w: w700,
                    c: i < 3 ? P.ink : P.faint,
                    tnum: true,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(h.word, 15, w: w700, f: F.semi),
                    if (h.hint.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      tx(h.hint, 13, w: w500, c: P.muted),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
  ]);
}
