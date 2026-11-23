// Plugin home page components: special modes, two-row horizontally scrolling cards, paged song grid, chart cards.
//
// Plugins only decide which component (Section.style), the order and the data; all styling is here,
// matching the Sketch final pages "首页与发现 · 组件（v1）" and "插件源 · 首页".

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../music/models.dart' as m;
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'remote.dart' show Art;
import 'links.dart';

/// Components the home page recognises; unknown styles return null and the caller uses the old style.
Widget? homeSection(String src, m.Section s) => switch (s.style) {
  'modes' when s.modes.isNotEmpty => ModesSection(src: src, modes: s.modes),
  'shelf'
      when s.playlists.isNotEmpty ||
          s.tracks.isNotEmpty ||
          s.albums.isNotEmpty ||
          s.artists.isNotEmpty =>
    Shelf(src: src, section: s),
  'songs' when s.tracks.isNotEmpty => SongGrid(src: src, section: s),
  'charts' when s.playlists.isNotEmpty => ChartCards(src: src, section: s),
  'grid'
      when s.playlists.isNotEmpty ||
          s.albums.isNotEmpty ||
          s.artists.isNotEmpty =>
    CardGrid(src: src, section: s),
  _ => null,
};

Color get _card => P.dark ? wa(0.05) : ba(0.04);
Color get _cardHover => P.dark ? wa(0.08) : ba(0.06);

/// Section header: title, optional description, buttons on the right.
class _Head extends StatelessWidget {
  const _Head(this.title, {this.sub = '', this.trailing = const []});
  final String title, sub;
  final List<Widget> trailing;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 32,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Title and description fill the left, buttons on the right
        Expanded(
          child: Row(
            children: [
              Flexible(
                child: tx(title, 20, w: w700, f: F.semi),
              ),
              if (sub.isNotEmpty) ...[
                const SizedBox(width: 12),
                Flexible(
                  child: tx(sub, 13, w: w500, c: P.faint),
                ),
              ],
            ],
          ),
        ),
        ...trailing,
      ],
    ),
  );
}

/// A pair of small round buttons for paging left and right.
List<Widget> _pager({
  required bool prev,
  required bool next,
  required VoidCallback onPrev,
  required VoidCallback onNext,
}) => [
  IconBtn(
    'chevron-left',
    size: BtnSize.s,
    enabled: prev,
    onTap: onPrev,
    tip: L.actionPrevPage,
  ),
  const SizedBox(width: 8),
  IconBtn(
    'chevron-right',
    size: BtnSize.s,
    enabled: next,
    onTap: onNext,
    tip: L.actionNextPage,
  ),
];

// ───── Special modes ─────

/// The first two modes are 200-high large cards; the rest are 80-high small rows, 3 per row.
class ModesSection extends StatelessWidget {
  const ModesSection({super.key, required this.src, required this.modes});
  final String src;
  final List<m.Mode> modes;

  // Identify cards by station id: if the order changes after a home refresh, state (previewed songs) follows the station
  Widget _hero(m.Mode x) => x.station.isNotEmpty
      ? _StationHero(key: ValueKey('station:${x.station}'), src: src, mode: x)
      : _CoversHero(src: src, mode: x);

  @override
  Widget build(BuildContext context) {
    final heroes = modes.take(2).toList();
    final rows = modes.skip(2).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 200,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < heroes.length; i++) ...[
                if (i > 0) const SizedBox(width: 24),
                Expanded(child: _hero(heroes[i])),
              ],
              if (heroes.length == 1) const Expanded(child: SizedBox()),
            ],
          ),
        ),
        for (var r = 0; r < rows.length; r += 3) ...[
          const SizedBox(height: 24),
          SizedBox(
            height: 80,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = r; i < r + 3; i++) ...[
                  if (i > r) const SizedBox(width: 16),
                  Expanded(
                    child: i < rows.length
                        ? _ModeRow(src: src, mode: rows[i])
                        : const SizedBox(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// Text on the left of a large card: small text, title, description, and a row of buttons at the bottom.
class _HeroText extends StatelessWidget {
  const _HeroText({
    required this.eyebrow,
    required this.title,
    required this.sub,
    required this.buttons,
    this.titleLinks,
    this.subLinks,
  });
  final Widget eyebrow;
  final String title, sub;
  final List<Widget> buttons;

  /// When given, tappable text replaces [title] / [sub].
  final List<LinkPart>? titleLinks, subLinks;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 18, child: eyebrow),
        const SizedBox(height: 4),
        titleLinks == null
            ? tx(title, 30, w: w900, f: F.wide, h: 1.2)
            : LinkText(
                titleLinks!,
                style: ts(30, w: w900, f: F.wide, h: 1.2),
              ),
        const SizedBox(height: 8),
        subLinks == null
            ? tx(sub, 14, w: w500, c: P.muted)
            : LinkText(
                subLinks!,
                style: ts(14, w: w500, c: P.muted),
              ),
        const Spacer(),
        Row(children: buttons),
      ],
    ),
  );
}

/// Daily picks and the like: three covers on the right, staggered like sheets of paper.
class _CoversHero extends StatelessWidget {
  const _CoversHero({required this.src, required this.mode});
  final String src;
  final m.Mode mode;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final ts = [for (final t in mode.tracks) Track.of(t.withSource(src))];
    final playable = ts.where((t) => !(t.ref?.unavailable ?? false)).toList();
    void play() {
      if (mode.playlist.isNotEmpty) {
        app.playPlaylist(src, mode.playlist);
      } else {
        app.playList(playable, name: mode.title);
      }
    }

    final covers = [
      for (final t in ts.take(3)) t.cover,
      if (ts.isEmpty && mode.imageUrl.isNotEmpty) mode.imageUrl,
    ];
    // Bottom to top: third, second, first song (topmost, rightmost)
    const spots = [
      (-224.0, 4.0, -9.0),
      (-160.0, -6.0, 6.0),
      (-104.0, 2.0, -3.0),
    ];
    final open = mode.playlist.isEmpty
        ? null
        : () => app.go(AppState.remoteRoute('playlist', src, mode.playlist));
    return Tap(
      onTap: open,
      cursor: open == null ? MouseCursor.defer : SystemMouseCursors.click,
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        decoration: squircle(20, color: h && open != null ? _cardHover : _card),
        clipBehavior: Clip.antiAlias,
        child: LayoutBuilder(
          builder: (context, c) => Stack(
            children: [
              for (var i = 0; i < covers.length; i++)
                () {
                  final (dx, dy, deg) = spots[3 - covers.length + i];
                  return Positioned(
                    left: c.maxWidth + dx - 64,
                    top: c.maxHeight / 2 - 4 + dy - 64,
                    child: Transform.rotate(
                      angle: deg * math.pi / 180,
                      child: Container(
                        decoration: squircle(
                          4,
                          shadows: [
                            BoxShadow(
                              color: ba(0.6),
                              blurRadius: 18,
                              offset: const Offset(0, 6),
                              spreadRadius: -4,
                            ),
                          ],
                        ),
                        child: Cover(
                          covers[covers.length - 1 - i],
                          w: 128,
                          h: 128,
                          r: 4,
                        ),
                      ),
                    ),
                  );
                }(),
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: math.max(0, c.maxWidth - 300),
                child: _HeroText(
                  eyebrow: tx(mode.note, 12, w: w600, c: P.faint),
                  title: mode.title,
                  sub: mode.subtitle,
                  buttons: [
                    PlayPill(
                      height: 40,
                      onTap: playable.isEmpty && mode.playlist.isEmpty
                          ? null
                          : play,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Songs shown on station cards, stored per source/station. Before playing, a prefetched batch; after playing,
/// the songs left in the queue when it stopped (from the song at that time), so playing again resumes from there.
final Map<String, List<Track>> _stationPreview = {};

/// Stations like personal FM: the cover fills the background and fades out to the left; the large text is the playing (or upcoming) song.
class _StationHero extends StatefulWidget {
  const _StationHero({super.key, required this.src, required this.mode});
  final String src;
  final m.Mode mode;

  @override
  State<_StationHero> createState() => _StationHeroState();
}

class _StationHeroState extends State<_StationHero> {
  String get _key => '${widget.src}/${widget.mode.station}';

  @override
  void initState() {
    super.initState();
    _preview();
  }

  // When the card's station changes (after a home refresh), fetch the preview again or the cover is empty
  @override
  void didUpdateWidget(_StationHero old) {
    super.didUpdateWidget(old);
    if (old.src != widget.src || old.mode.station != widget.mode.station) {
      _preview();
    }
  }

  Future<void> _preview() async {
    final key = _key;
    if (_stationPreview[key]?.isNotEmpty ?? false) return;
    try {
      final ts = await context.appRead.stationBatch(
        widget.src,
        widget.mode.station,
      );
      if (!mounted) return;
      setState(() => _stationPreview[key] = ts);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final mode = widget.mode;
    final on = app.station == (widget.src, mode.station);
    // While playing: remember the queue from the current song, so the card stays on this song after switching to something else
    if (on && app.queue.isNotEmpty) {
      _stationPreview[_key] = app.queue.sublist(app.index);
    }
    final preview = _stationPreview[_key] ?? const [];
    final t = on ? app.track : preview.firstOrNull;
    final base = P.dark ? const Color(0xFF161618) : const Color(0xFFF4F4F5);

    void start() {
      app.playStation(
        widget.src,
        mode.station,
        mode.title,
        first: preview.isEmpty ? null : List.of(preview),
      );
    }

    // Before playback starts, "next" starts right from the next previewed song
    void next() {
      if (on) return app.next();
      if (preview.length > 1) preview.removeAt(0);
      start();
    }

    final playing = on && app.playing;
    return Tap(
      cursor: SystemMouseCursors.basic,
      onMenu: t == null
          ? null
          : (p) => showMenu(context, p, trackMenu(context, t)),
      builder: (_, _, _) => Container(
        decoration: squircle(20, color: _card),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (t != null) ...[
              // The cover fills the whole card; the left side is covered by the background color, fading to the right
              LayoutBuilder(
                builder: (_, c) =>
                    Cover(t.cover, w: c.maxWidth, h: c.maxHeight, r: 0),
              ),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      base,
                      base,
                      base.withValues(alpha: 0.6),
                      base.withValues(alpha: 0),
                    ],
                    stops: const [0, 0.36, 0.62, 1],
                  ),
                ),
              ),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      base.withValues(alpha: 0),
                      base.withValues(alpha: 0.4),
                    ],
                    stops: const [0.5, 1],
                  ),
                ),
              ),
            ],
            _HeroText(
              eyebrow: Row(
                children: [
                  PlayingBars(playing: on && app.playing, rest: 0.7),
                  const SizedBox(width: 8),
                  tx(mode.title, 12, w: w700, c: accent),
                ],
              ),
              title: t?.title ?? mode.title,
              sub: t?.artist ?? mode.subtitle,
              titleLinks: t == null
                  ? null
                  : [(text: t.title, route: app.albumRouteOf(t))],
              subLinks: t == null ? null : joinLinks([artistLinks(app, t)]),
              buttons: [
                PlayPill(
                  height: 40,
                  label: playing
                      ? context.l10n.actionPause
                      : context.l10n.actionPlay,
                  icon: playing ? 'pause' : 'play',
                  onTap: on ? app.togglePlay : start,
                ),
                const SizedBox(width: 8),
                // Like and dislike are in the context menu
                IconBtn(
                  'next',
                  tip: context.l10n.actionNext,
                  enabled: t != null,
                  onTap: t == null ? null : next,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// 80-high small rows: radar playlists, heartbeat mode, similar songs…
class _ModeRow extends StatelessWidget {
  const _ModeRow({required this.src, required this.mode});
  final String src;
  final m.Mode mode;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final isStation = mode.station.isNotEmpty;
    final on = isStation && app.station == (src, mode.station);
    // The station has no image: use the playing song's cover (similar songs start from it)
    var image = mode.imageUrl;
    if (image.isEmpty && isStation && app.track.ref?.source == src) {
      image = app.track.cover;
    }
    if (image.isEmpty && mode.tracks.isNotEmpty) {
      image = mode.tracks.first.album.imageUrl;
    }
    void play() {
      if (on) return app.togglePlay();
      if (isStation) {
        app.playStation(src, mode.station, mode.title);
      } else if (mode.playlist.isNotEmpty) {
        app.playPlaylist(src, mode.playlist);
      } else {
        app.playList([
          for (final t in mode.tracks)
            if (!t.unavailable) Track.of(t.withSource(src)),
        ], name: mode.title);
      }
    }

    void open() => mode.playlist.isNotEmpty
        ? app.go(AppState.remoteRoute('playlist', src, mode.playlist))
        : play();

    return Tap(
      onTap: open,
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        padding: const EdgeInsets.fromLTRB(8, 8, 16, 8),
        decoration: squircle(16, color: h ? _cardHover : _card),
        child: Row(
          children: [
            image.isEmpty
                ? Container(
                    width: 64,
                    height: 64,
                    alignment: Alignment.center,
                    decoration: squircle(10, color: P.raised),
                    child: Ico(
                      isStation ? 'broadcast' : 'music',
                      size: 20,
                      color: P.faint,
                    ),
                  )
                : Cover(image, w: 64, h: 64, r: 10),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(
                    mode.title,
                    15,
                    w: w700,
                    f: F.semi,
                    c: on ? accent : P.ink,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (isStation) ...[
                        Ico('broadcast', size: 16, color: P.faint),
                        const SizedBox(width: 5),
                      ],
                      Flexible(
                        child: tx(mode.subtitle, 12, w: w500, c: P.faint),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            IconBtn(
              on && app.playing ? 'pause' : 'play',
              size: BtnSize.s,
              tip: on && app.playing
                  ? context.l10n.actionPause
                  : context.l10n.actionPlay,
              onTap: play,
            ),
          ],
        ),
      ),
    );
  }
}

// ───── Cards: two horizontally scrolling rows ─────

/// Cards for playlists, albums, songs or artists (round avatars). 6.5 columns per screen; over one screen, two rows that scroll horizontally.
class Shelf extends StatefulWidget {
  const Shelf({super.key, required this.src, required this.section});
  final String src;
  final m.Section section;

  @override
  State<Shelf> createState() => _ShelfState();
}

class _ShelfState extends State<Shelf> {
  final _c = ScrollController();
  bool _prev = false, _next = true;

  static const gap = 24.0;

  @override
  void initState() {
    super.initState();
    _c.addListener(_edges);
    WidgetsBinding.instance.addPostFrameCallback((_) => _edges());
  }

  void _edges() {
    if (!_c.hasClients) return;
    final p = _c.position;
    final prev = p.pixels > 1, next = p.pixels < p.maxScrollExtent - 1;
    if (prev != _prev || next != _next) {
      setState(() {
        _prev = prev;
        _next = next;
      });
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  void _page(int dir, double step) {
    if (!_c.hasClients) return;
    final p = _c.position;
    _c.animateTo(
      (p.pixels + dir * step).clamp(0, p.maxScrollExtent),
      duration: const Duration(milliseconds: 420),
      curve: snappy,
    );
  }

  List<Widget> _cards(BuildContext context, double w) {
    final app = context.appRead;
    final src = widget.src, s = widget.section;
    final ts = [for (final t in s.tracks) Track.of(t.withSource(src))];
    return [
      for (final p in s.playlists)
        _ShelfCard(
          w: w,
          image: p.imageUrl,
          title: p.name,
          sub: p.subtitle.isNotEmpty
              ? p.subtitle
              : (p.trackCount > 0
                    ? context.l10n.countTracks(p.trackCount)
                    : p.owner),
          plays: p.plays,
          onTap: () => app.go(AppState.remoteRoute('playlist', src, p.id)),
        ),
      for (final a in s.albums)
        _ShelfCard(
          w: w,
          image: a.imageUrl,
          title: a.name,
          sub: a.artists.map((x) => x.name).join('、'),
          onTap: () => app.go(AppState.remoteRoute('album', src, a.id)),
        ),
      for (var i = 0; i < ts.length; i++)
        _ShelfCard(
          w: w,
          image: ts[i].cover,
          title: ts[i].title,
          sub: ts[i].artist,
          onTap: () => app.playList(ts, start: i, name: s.title),
          onMenu: (p) => showMenu(context, p, trackMenu(context, ts[i])),
        ),
      for (final a in s.artists)
        _ShelfCard(
          w: w,
          round: true,
          image: a.imageUrl,
          title: a.name,
          sub: '',
          onTap: () => app.go(AppState.remoteRoute('artist', src, a.id)),
        ),
    ];
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, c) {
      // Card width follows the window: as many whole cards as fit (about 180 each), plus half a card to hint at scrolling
      final n = ((c.maxWidth + gap) / (180 + gap)).floor().clamp(3, 10);
      final w = ((c.maxWidth - gap * n) / (n + 0.5)).floorToDouble();
      final s = widget.section;
      final count =
          s.playlists.length +
          s.albums.length +
          s.tracks.length +
          s.artists.length;
      // Use two rows only when both fill a screen; otherwise one row, so two half-filled rows don't leave a gap at the end
      final rows = count >= 2 * (n + 1) ? 2 : 1;
      final cards = _cards(context, w);
      final cols = (cards.length / rows).ceil();
      final scrolls = cols * (w + gap) - gap > c.maxWidth;
      final step = (w + gap) * n;
      final fade = w / 2 + gap;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Head(
            widget.section.title,
            sub: widget.section.subtitle,
            trailing: scrolls
                ? _pager(
                    prev: _prev,
                    next: _next,
                    onPrev: () => _page(-1, step),
                    onNext: () => _page(1, step),
                  )
                : const [],
          ),
          const SizedBox(height: 10),
          ShaderMask(
            blendMode: BlendMode.dstIn,
            shaderCallback: (r) => LinearGradient(
              colors: [
                _prev ? const Color(0x00FFFFFF) : const Color(0xFFFFFFFF),
                const Color(0xFFFFFFFF),
                const Color(0xFFFFFFFF),
                scrolls && _next
                    ? const Color(0x00FFFFFF)
                    : const Color(0xFFFFFFFF),
              ],
              stops: [0, fade / r.width, 1 - fade / r.width, 1],
            ).createShader(r),
            child: SingleChildScrollView(
              controller: _c,
              scrollDirection: Axis.horizontal,
              // Covers grow 3% on hover; leave room above and below so they aren't clipped
              padding: const EdgeInsets.symmetric(vertical: 6),
              // Lay out by rows, not columns, so cover tops align exactly in each row regardless of title line count or subtitle
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (var r = 0; r < rows; r++) ...[
                    if (r > 0) const SizedBox(height: 28),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (var col = 0; col < cols; col++) ...[
                          if (col > 0) const SizedBox(width: gap),
                          if (col * rows + r < cards.length)
                            cards[col * rows + r]
                          else
                            SizedBox(width: w),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      );
    },
  );
}

class _ShelfCard extends StatelessWidget {
  const _ShelfCard({
    required this.w,
    required this.image,
    required this.title,
    required this.sub,
    required this.onTap,
    this.onMenu,
    this.plays = 0,
    this.round = false,
  });
  final double w;

  /// Artist: round avatar, name centered.
  final bool round;
  final String image, title, sub;
  final VoidCallback onTap;
  final void Function(Offset)? onMenu;

  /// Play count; when above 0, a headphone pill shows at the top right of the cover.
  final int plays;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    onMenu: onMenu,
    builder: (_, h, _) => SizedBox(
      width: w,
      child: Column(
        crossAxisAlignment: round
            ? CrossAxisAlignment.center
            : CrossAxisAlignment.start,
        children: [
          AnimatedScale(
            duration: fast,
            scale: h ? 1.03 : 1,
            child: Stack(
              children: [
                image.isEmpty
                    ? Art('', size: w, round: round)
                    : Cover(image, w: w, h: w, r: round ? w / 2 : 14),
                if (plays > 0)
                  Positioned(top: 8, right: 8, child: PlaysPill(plays)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          tx(title, 15, w: w700, c: h ? accent : P.ink, lines: 2),
          if (sub.isNotEmpty) ...[
            const SizedBox(height: 4),
            tx(sub, 13, w: w500, c: P.faint),
          ],
        ],
      ),
    ),
  );
}

// ───── Categories: top of the Discover page ─────
// Final "发现 · 顶部分类与更多分类": top row of colored-dot category cards (horizontal scroll + expand),
// below them sub-category pills, with "More categories" expanding in place below the pills.

/// Top category cards: a horizontally scrolling row with an expand button at the far right; expanded, all cards wrap.
/// Cards are a colored dot + name; selected is inverted (like pills), hover white 8%, normally 5%.
class CategoryCards extends StatefulWidget {
  const CategoryCards({
    super.key,
    required this.items,
    required this.selected,
    required this.onTap,
    required this.expanded,
    required this.onExpand,
  });
  final List<m.Choice> items;
  final int selected;
  final ValueChanged<int> onTap;
  final bool expanded;
  final ValueChanged<bool> onExpand;

  static const gap = 12.0, h = 48.0;

  @override
  State<CategoryCards> createState() => _CategoryCardsState();
}

class _CategoryCardsState extends State<CategoryCards> {
  final _c = ScrollController();
  final _on = GlobalKey();
  bool _prev = false, _next = false;

  @override
  void initState() {
    super.initState();
    _c.addListener(_edges);
    WidgetsBinding.instance.addPostFrameCallback((_) => _reveal(false));
  }

  @override
  void didUpdateWidget(CategoryCards old) {
    super.didUpdateWidget(old);
    if (old.selected != widget.selected || old.expanded != widget.expanded) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _reveal(true));
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  void _edges() {
    if (!_c.hasClients) return;
    final p = _c.position;
    final prev = p.pixels > 1, next = p.pixels < p.maxScrollExtent - 1;
    if (prev != _prev || next != _next) {
      setState(() {
        _prev = prev;
        _next = next;
      });
    }
  }

  /// Scrolls the selected card into view (e.g. after picking a later channel from the expanded panel).
  void _reveal(bool animate) {
    if (!mounted) return;
    _edges();
    final c = _on.currentContext;
    if (c == null || widget.expanded) return;
    Scrollable.ensureVisible(
      c,
      alignment: 0.5,
      alignmentPolicy: ScrollPositionAlignmentPolicy.explicit,
      duration: animate ? const Duration(milliseconds: 360) : Duration.zero,
      curve: snappy,
    );
  }

  List<Widget> _cards() => [
    for (final (i, x) in widget.items.indexed)
      _GroupCard(
        key: i == widget.selected ? _on : null,
        item: x,
        on: i == widget.selected,
        onTap: () => widget.onTap(i),
      ),
  ];

  @override
  Widget build(BuildContext context) {
    const g = CategoryCards.gap;
    final button = IconBtn(
      widget.expanded ? 'chevron-up' : 'chevron-down',
      size: BtnSize.m,
      tip: widget.expanded
          ? context.l10n.actionCollapse
          : context.l10n.actionExpandAllCategories,
      onTap: () => widget.onExpand(!widget.expanded),
    );
    if (widget.expanded) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Wrap(spacing: g, runSpacing: g, children: _cards()),
          ),
          const SizedBox(width: g),
          SizedBox(
            height: CategoryCards.h,
            child: Center(child: button),
          ),
        ],
      );
    }
    const fade = 48.0;
    return SizedBox(
      height: CategoryCards.h,
      child: Row(
        children: [
          Expanded(
            child: ShaderMask(
              blendMode: BlendMode.dstIn,
              shaderCallback: (r) => LinearGradient(
                colors: [
                  _prev ? const Color(0x00FFFFFF) : const Color(0xFFFFFFFF),
                  const Color(0xFFFFFFFF),
                  const Color(0xFFFFFFFF),
                  _next ? const Color(0x00FFFFFF) : const Color(0xFFFFFFFF),
                ],
                stops: [0, fade / r.width, 1 - fade / r.width, 1],
              ).createShader(r),
              child: SingleChildScrollView(
                controller: _c,
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (final (i, c) in _cards().indexed) ...[
                      if (i > 0) const SizedBox(width: g),
                      c,
                    ],
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: g),
          button,
        ],
      ),
    );
  }
}

/// Category dot colors: the 6 theme colors from Settings, plus 6 more with the same lightness and saturation (final "圆点颜色").
const _dotsDark = [
  Color(0xFFD6B0FA), Color(0xFF8EC5FF), Color(0xFF8FE3C0), //
  Color(0xFFF6C453), Color(0xFFFF9EB5), Color(0xFFFF9A5C),
  Color(0xFF7DD3E8), Color(0xFFB9E26F), Color(0xFFA5ADFF),
  Color(0xFFFF8378), Color(0xFFEFA3E6), Color(0xFFD9B48C),
];
const _dotsLight = [
  Color(0xFF7C4FD6), Color(0xFF2F7DE1), Color(0xFF1F9E6E), //
  Color(0xFFC88A0A), Color(0xFFD6406A), Color(0xFFD9601E),
  Color(0xFF1E9BB5), Color(0xFF6E9A1F), Color(0xFF5560E0),
  Color(0xFFD9483D), Color(0xFFB24FA6), Color(0xFFA6743F),
];

/// Picks a dot color by name: FNV-1a hash, so the same name always gets the same color
/// (String.hashCode differs on every launch, so it can't be used). [onInk] means the dot sits on an inverted background
/// (selected card), which needs a different set of colors to stay visible.
Color categoryDot(String name, {bool onInk = false}) {
  var h = 0x811c9dc5;
  for (final c in name.codeUnits) {
    h = ((h ^ c) * 0x01000193) & 0xFFFFFFFF;
  }
  final dots = P.dark != onInk ? _dotsDark : _dotsLight;
  return dots[h % dots.length];
}

/// A category card: colored dot + name, 48 high, radius 14.
class _GroupCard extends StatelessWidget {
  const _GroupCard({
    super.key,
    required this.item,
    required this.on,
    required this.onTap,
  });
  final m.Choice item;
  final bool on;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, p) => PressScale(
      pressed: p,
      down: 0.97,
      child: AnimatedContainer(
        duration: fast,
        height: CategoryCards.h,
        padding: const EdgeInsets.only(left: 16, right: 18),
        decoration: squircle(
          14,
          color: on
              ? P.ink
              : (P.dark ? wa(h ? 0.08 : 0.05) : ba(h ? 0.06 : 0.04)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: categoryDot(item.title, onInk: on),
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
            tx(item.title, 16, w: w700, f: F.semi, c: on ? P.ground : null),
          ],
        ),
      ),
    ),
  );
}

/// "More categories" expands in place (final option A): a white 5% panel, one row per group, group name on the left,
/// followed by small labels.
class CategoryPanel extends StatelessWidget {
  const CategoryPanel({
    super.key,
    required this.groups,
    required this.isOn,
    required this.onTap,
  });
  final List<m.ChoiceGroup> groups;
  final bool Function(m.Choice) isOn;
  final ValueChanged<m.Choice> onTap;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.fromLTRB(24, 24, 24, 4),
    decoration: squircle(20, color: P.dark ? wa(0.05) : ba(0.04)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final g in groups)
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 72,
                  height: 28,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: tx(g.title, 14, w: w700, f: F.semi, c: P.faint),
                  ),
                ),
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final o in g.options)
                        UiTag(
                          o.title,
                          selected: isOn(o),
                          onTap: () => onTap(o),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    ),
  );
}

/// Sub-category pills: 36 high, 14 text, 16 horizontal padding. Selected #F7F7F8 with black text, hover white 12%, normally white 8%.
class CategoryChip extends StatelessWidget {
  const CategoryChip(
    this.label, {
    super.key,
    required this.onTap,
    this.selected = false,
    this.open = false,
  });
  final String label;
  final VoidCallback onTap;
  final bool selected;

  /// The "More categories" panel is open: keep the hover background.
  final bool open;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, p) => PressScale(
      pressed: p,
      down: 0.95,
      child: AnimatedContainer(
        duration: fast,
        height: 36,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        // No alignment: setting it makes it fill the whole row inside Wrap
        decoration: squircle(
          18,
          color: selected
              ? P.ink
              : (P.dark
                    ? wa(h || open ? 0.12 : 0.08)
                    : ba(h || open ? 0.09 : 0.05)),
        ),
        child: Center(
          widthFactor: 1,
          child: tx(
            label,
            14,
            w: w700,
            f: F.semi,
            c: selected ? P.ground : null,
          ),
        ),
      ),
    ),
  );
}

// ───── Card grid ─────

/// Cards filling each row and wrapping down: playlist plaza, artist list, chart groups.
/// Column count is computed like the shelf at about 180 per card; card width fills the row.
class CardGrid extends StatelessWidget {
  const CardGrid({super.key, required this.src, required this.section});
  final String src;
  final m.Section section;

  static const gap = 24.0;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final s = section;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (s.title.isNotEmpty) ...[
          _Head(s.title, sub: s.subtitle),
          const SizedBox(height: 10),
        ],
        LayoutBuilder(
          builder: (context, c) {
            final n = ((c.maxWidth + gap) / (180 + gap)).floor().clamp(3, 10);
            final w = ((c.maxWidth - gap * (n - 1)) / n).floorToDouble();
            final cards = <Widget>[
              for (final p in s.playlists)
                _ShelfCard(
                  w: w,
                  image: p.imageUrl,
                  title: p.name,
                  sub: p.subtitle.isNotEmpty
                      ? p.subtitle
                      : (p.owner.isNotEmpty
                            ? p.owner
                            : (p.trackCount > 0
                                  ? context.l10n.countTracks(p.trackCount)
                                  : '')),
                  plays: p.plays,
                  onTap: () =>
                      app.go(AppState.remoteRoute('playlist', src, p.id)),
                ),
              for (final a in s.albums)
                _ShelfCard(
                  w: w,
                  image: a.imageUrl,
                  title: a.name,
                  sub: a.artists.map((x) => x.name).join('、'),
                  onTap: () => app.go(AppState.remoteRoute('album', src, a.id)),
                ),
              for (final a in s.artists)
                _ShelfCard(
                  w: w,
                  round: true,
                  image: a.imageUrl,
                  title: a.name,
                  sub: '',
                  onTap: () =>
                      app.go(AppState.remoteRoute('artist', src, a.id)),
                ),
            ];
            // Covers grow 3% on hover; leave room above and below
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Wrap(spacing: gap, runSpacing: 32, children: cards),
            );
          },
        ),
      ],
    );
  }
}

// ───── Songs: paged grid ─────

/// 3 columns × 4 rows per page, with "Play all" and paging to the right of the title.
class SongGrid extends StatefulWidget {
  const SongGrid({super.key, required this.src, required this.section});
  final String src;
  final m.Section section;

  @override
  State<SongGrid> createState() => _SongGridState();
}

class _SongGridState extends State<SongGrid> {
  final _c = PageController();
  int _page = 0;
  static const per = 12, cols = 3, rowH = 56.0;

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  // All pages sit side by side; paging slides a whole page over (same duration and curve as the shelf).
  void _go(int page) => _c.animateToPage(
    page,
    duration: const Duration(milliseconds: 420),
    curve: snappy,
  );

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final s = widget.section;
    final ts = [for (final t in s.tracks) Track.of(t.withSource(widget.src))];
    final ok = ts.where((t) => !(t.ref?.unavailable ?? false)).toList();
    final pages = (ts.length / per).ceil();
    final page = _page.clamp(0, math.max(0, pages - 1)).toInt();
    // Height is based on the first (fullest) page; later partial pages align to the top
    final rows = (math.min(ts.length, per) / cols).ceil();
    void play(Track t) {
      if (app.track.key == t.key) return app.togglePlay();
      app.playList(ok, start: math.max(0, ok.indexOf(t)), name: s.title);
    }

    Widget pageAt(int i) {
      final shown = ts.skip(i * per).take(per).toList();
      final perCol = (shown.length / cols).ceil();
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var c = 0; c < cols; c++) ...[
            if (c > 0) const SizedBox(width: 32),
            Expanded(
              child: Column(
                children: [
                  for (final t in shown.skip(c * perCol).take(perCol))
                    _SongCell(track: t, onPlay: () => play(t)),
                ],
              ),
            ),
          ],
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Head(
          s.title,
          sub: s.subtitle,
          trailing: [
            Btn(
              label: context.l10n.actionPlayAll,
              icon: 'play',
              size: BtnSize.s,
              onTap: ok.isEmpty ? null : () => app.playList(ok, name: s.title),
            ),
            if (pages > 1) ...[
              const SizedBox(width: 16),
              ..._pager(
                prev: page > 0,
                next: page < pages - 1,
                onPrev: () => _go(page - 1),
                onNext: () => _go(page + 1),
              ),
            ],
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: rows * rowH,
          child: PageView.builder(
            controller: _c,
            itemCount: pages,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (_, i) => pageAt(i),
          ),
        ),
      ],
    );
  }
}

class _SongCell extends StatelessWidget {
  const _SongCell({required this.track, required this.onPlay});
  final Track track;
  final VoidCallback onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = track;
    final off = t.ref?.unavailable ?? false;
    final current = app.track.key == t.key;
    final liked = app.liked.contains(t.key);
    return Tap(
      onDoubleTap: off ? null : onPlay,
      onMenu: (p) => showMenu(context, p, trackMenu(context, t)),
      builder: (_, h, _) => Opacity(
        opacity: off ? 0.4 : 1,
        child: AnimatedContainer(
          duration: fast,
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: squircle(
            12,
            color: h && !off ? _card : const Color(0x00000000),
          ),
          child: Row(
            children: [
              Tap(
                onTap: off ? null : onPlay,
                builder: (_, _, _) => Stack(
                  children: [
                    Cover(t.cover, w: 40, h: 40, r: 6),
                    if ((h && !off) || current)
                      Container(
                        width: 40,
                        height: 40,
                        alignment: Alignment.center,
                        decoration: squircle(6, color: ba(0.4)),
                        child: current && !h
                            ? PlayingBars(playing: app.playing, color: white)
                            : Ico(
                                current && app.playing ? 'pause' : 'play',
                                size: 20,
                                color: white,
                              ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(t.title, 14, w: w700, c: current ? accent : P.ink),
                    const SizedBox(height: 2),
                    LinkText(
                      joinLinks([artistLinks(app, t)]),
                      style: ts(12, w: w500, c: P.muted),
                    ),
                  ],
                ),
              ),
              if (h || liked) ...[
                const SizedBox(width: 8),
                Tap(
                  onTap: () => app.toggleLike(t),
                  tip: liked
                      ? context.l10n.actionUnlike
                      : context.l10n.actionLike,
                  builder: (_, _, _) => Ico(
                    liked ? 'heart-filled' : 'heart',
                    size: 16,
                    color: liked ? heart : P.muted,
                  ),
                ),
              ],
              const SizedBox(width: 8),
              SizedBox(
                width: 40,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: t.seconds > 0
                      ? tx(t.dur, 13, w: w600, c: P.faint, tnum: true)
                      : const SizedBox(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ───── Charts ─────

/// Up to 4 chart cards per row: cover, name, update time, and the top three below.
class ChartCards extends StatelessWidget {
  const ChartCards({super.key, required this.src, required this.section});
  final String src;
  final m.Section section;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final xs = section.playlists.take(4).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Head(section.title, sub: section.subtitle),
        const SizedBox(height: 16),
        SizedBox(
          height: 268,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < 4; i++) ...[
                if (i > 0) const SizedBox(width: 16),
                Expanded(
                  child: i < xs.length
                      ? _ChartCard(
                          p: xs[i],
                          src: src,
                          onTap: () => app.go(
                            AppState.remoteRoute('playlist', src, xs[i].id),
                          ),
                        )
                      : const SizedBox(),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _ChartCard extends StatelessWidget {
  const _ChartCard({required this.p, required this.src, required this.onTap});
  final m.Playlist p;
  final String src;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, _) => AnimatedContainer(
      duration: fast,
      padding: const EdgeInsets.all(16),
      decoration: squircle(20, color: h ? _cardHover : _card),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Art(p.imageUrl, size: 64),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(p.name, 15, w: w700, f: F.semi, c: h ? accent : P.ink),
                    const SizedBox(height: 6),
                    tx(
                      p.description.isNotEmpty ? p.description : p.subtitle,
                      12,
                      w: w500,
                      c: P.faint,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          for (var j = 0; j < p.tracks.length && j < 3; j++)
            // 16 + 64 + 20 + 52 + 52 + 44 + 16 = 264, fits in the 268-high card
            SizedBox(
              height: j < 2 ? 52 : 44,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 32,
                    child: tx(
                      '${j + 1}',
                      17,
                      w: w900,
                      f: F.wide,
                      c: j == 0 ? P.ink : P.faint,
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        tx(p.tracks[j].name, 14, w: w700),
                        const SizedBox(height: 2),
                        LinkText(
                          artistLinks(
                            context.app,
                            Track.of(p.tracks[j].withSource(src)),
                          ),
                          style: ts(12, w: w500, c: P.muted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    ),
  );
}

/// Play count: Chinese 1.2 亿 / 71.4 万, English 120M / 714K.
String playsText(int n) => formatShortCount(n, currentLocale);

/// Play count pill at the top right of the cover: headphone icon + number.
class PlaysPill extends StatelessWidget {
  const PlaysPill(this.plays, {super.key});
  final int plays;

  @override
  Widget build(BuildContext context) => Container(
    height: 22,
    padding: const EdgeInsets.fromLTRB(7, 0, 8, 0),
    decoration: squircle(11, color: ba(0.5)),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Ico('headphones', size: 16, color: white),
        const SizedBox(width: 4),
        tx(playsText(plays), 11, w: w700, c: white, tnum: true),
      ],
    ),
  );
}
