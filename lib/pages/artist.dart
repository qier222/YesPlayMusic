import 'package:flutter/widgets.dart';

import '../cover_color.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../shell.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'links.dart';

/// 歌手页上的一张专辑 / 单曲。
class ArtistDisc {
  const ArtistDisc({
    required this.title,
    required this.cover,
    this.year = '',
    this.route = '',
    this.kind = '',
    this.date = '',
    this.meta = '',
    this.menu,
    this.play,
  });
  final String title, cover, year, route;

  /// 「最新发布」卡片上的类型、日期和曲目信息。
  final String kind, date, meta;
  final MenuSpec Function(BuildContext context)? menu;
  final void Function(AppState app)? play;
}

/// 相似歌手。
typedef ArtistLink = ({String name, String cover, String route});

/// 歌手页的数据。
class ArtistData {
  const ArtistData({
    required this.name,
    required this.avatar,
    this.following = false,
    this.follow,
    this.hot = const [],
    this.latest,
    this.tabs = const [],
    this.similar = const [],
    this.menu,
  });
  final String name, avatar;
  final bool following;

  /// 关注 / 取消关注；源不支持时为 null，不显示关注按钮。
  final Future<void> Function(bool on)? follow;
  final List<Track> hot;
  final ArtistDisc? latest;

  /// 专辑、单曲与 EP… 每个分页一组；空的分页不显示。
  final List<(String, List<ArtistDisc>)> tabs;
  final List<ArtistLink> similar;
  final MenuSpec Function(BuildContext context)? menu;
}

class ArtistPage extends StatefulWidget {
  const ArtistPage({super.key, required this.data});

  final ArtistData data;

  @override
  State<ArtistPage> createState() => _ArtistPageState();
}

class _ArtistPageState extends State<ArtistPage> {
  final _scroll = ScrollController();
  // 每个分页一个：切换时新旧两行同时在淡入淡出，不能共用一个
  final _discs = <int, ScrollController>{};
  ScrollController _disc(int i) => _discs.putIfAbsent(i, ScrollController.new);
  bool _sticky = false;
  int _tab = 0;

  /// 关注状态：点了先变，再告诉源。null 表示跟着数据走。
  bool? _following;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      final s = _scroll.offset > 200;
      if (s != _sticky) setState(() => _sticky = s);
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    for (final c in _discs.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final d = widget.data;
    final tabs = d.tabs.where((t) => t.$2.isNotEmpty).toList();
    final tab = tabs.isEmpty ? 0 : _tab.clamp(0, tabs.length - 1);
    final following = _following ?? d.following;
    final follow = d.follow == null
        ? null
        : () {
            final on = !following;
            setState(() => _following = on);
            showToast(on ? L.artistFollowed(d.name) : L.artistUnfollowed);
            d.follow!(on).catchError((Object _) {
              if (mounted) setState(() => _following = !on);
              showToast(on ? L.artistFollowFailed : L.artistUnfollowFailed);
            });
          };
    Widget actions(double h) =>
        _Actions(h: h, data: d, following: following, onFollow: follow);
    return Stack(
      children: [
        Positioned.fill(
          child: SingleChildScrollView(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(40, 20, 40, 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                BackBtn(onTap: app.back),
                const SizedBox(height: 32),
                FadeIn(
                  child: Row(
                    children: [
                      Cover(d.avatar, w: 148, h: 148, r: 74),
                      const SizedBox(width: 32),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            tx(
                              context.l10n.tabArtists,
                              13,
                              w: w700,
                              f: F.semi,
                              c: P.muted,
                            ),
                            const SizedBox(height: 4),
                            Transform.translate(
                              offset: const Offset(-2, 0),
                              child: tx(d.name, 60, w: w900, f: F.wide),
                            ),
                          ],
                        ),
                      ),
                      actions(48),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                if (d.latest != null || d.hot.isNotEmpty)
                  FadeIn(delay: 60, child: _Top(data: d)),
                if (tabs.isNotEmpty) ...[
                  const SizedBox(height: 36),
                  SizedBox(
                    height: 28,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        for (final (i, t) in [
                          for (final t in tabs) (t.$1, '${t.$2.length}'),
                        ].indexed) ...[
                          if (i > 0) const SizedBox(width: 28),
                          Tap(
                            onTap: () {
                              setState(() => _tab = i);
                            },
                            builder: (_, h, _) => Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                AnimatedDefaultTextStyle(
                                  duration: fast,
                                  style: ts(
                                    20,
                                    w: w700,
                                    f: F.semi,
                                    c: i == tab
                                        ? P.ink
                                        : (h ? P.muted : P.faint),
                                  ),
                                  child: Text(t.$1),
                                ),
                                const SizedBox(width: 6),
                                tx(
                                  t.$2,
                                  13,
                                  w: w700,
                                  c: i == tab ? P.muted : P.faint,
                                ),
                              ],
                            ),
                          ),
                        ],
                        const Spacer(),
                        // 超过一屏（6 张）可以横向翻页，不放「全部」
                        if (tabs[tab].$2.length > 6)
                          _DiscPager(
                            key: ValueKey(tab),
                            controller: _disc(tab),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AnimatedSwitcher(
                    transitionBuilder: fadeOnly,
                    duration: const Duration(milliseconds: 260),
                    child: LayoutBuilder(
                      key: ValueKey(tab),
                      builder: (context, c) {
                        final w = (c.maxWidth - 20 * 5) / 6;
                        final discs = tabs[tab].$2;
                        return SingleChildScrollView(
                          controller: _disc(tab),
                          scrollDirection: Axis.horizontal,
                          physics: discs.length > 6
                              ? null
                              : const NeverScrollableScrollPhysics(),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              for (final (i, x) in discs.indexed) ...[
                                if (i > 0) const SizedBox(width: 20),
                                SizedBox(
                                  width: w,
                                  child: FadeIn(
                                    delay: (i < 6 ? i : 6) * 30,
                                    child: _DiscCard(d: x),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
                if (d.similar.isNotEmpty) ...[
                  const SizedBox(height: 40),
                  SectionTitle(context.l10n.artistSimilar),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      for (final s in d.similar.take(8))
                        Tap(
                          onTap: s.route.isEmpty ? null : () => app.go(s.route),
                          builder: (_, h, p) => SizedBox(
                            width: 128,
                            child: Column(
                              children: [
                                PressScale(
                                  pressed: p,
                                  hover: h,
                                  up: 1.05,
                                  child: Cover(s.cover, w: 128, h: 128, r: 64),
                                ),
                                const SizedBox(height: 10),
                                tx(s.name, 13, w: w700, f: F.semi),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
        // 滑过头像之后出现的顶栏（设计稿 Sticky Header 高 80）
        Positioned(
          left: 0,
          right: 0,
          top: 0,
          height: 80,
          child: IgnorePointer(
            ignoring: !_sticky,
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 180),
              opacity: _sticky ? 1 : 0,
              child: AnimatedSlide(
                duration: const Duration(milliseconds: 180),
                offset: Offset(0, _sticky ? 0 : -12 / 80),
                child: Container(
                  decoration: BoxDecoration(
                    color: P.ground,
                    border: Border(bottom: BorderSide(color: P.line)),
                  ),
                  child: Stack(
                    children: [
                      const Positioned.fill(child: DragWindow()),
                      Positioned.fill(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 40),
                          child: Row(
                            children: [
                              BackBtn(onTap: app.back),
                              const SizedBox(width: 12),
                              Cover(d.avatar, w: 40, h: 40, r: 20),
                              const SizedBox(width: 12),
                              Flexible(
                                child: tx(d.name, 20, w: w800, f: F.wide),
                              ),
                              const Spacer(),
                              actions(40),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Actions extends StatelessWidget {
  const _Actions({
    required this.h,
    required this.data,
    required this.following,
    required this.onFollow,
  });
  final double h;
  final ArtistData data;
  final bool following;
  final VoidCallback? onFollow;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final d = data;
    return Row(
      children: [
        PlayPill(
          height: h,
          onTap: d.hot.isEmpty
              ? null
              : () => app.playList(
                  d.hot,
                  name: context.l10n.artistHotTracksOf(d.name),
                ),
        ),
        if (onFollow != null) ...[
          const SizedBox(width: 10),
          Btn(
            label: following
                ? context.l10n.actionFollowing
                : context.l10n.actionFollow,
            size: BtnSize.fromHeight(h),
            kind: BtnKind.secondary,
            iconWidget: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
              child: Ico(
                following ? 'check' : 'plus',
                key: ValueKey(following),
                size: BtnSize.fromHeight(h).icon,
                color: P.ink,
              ),
            ),
            onTap: onFollow,
          ),
        ],
        if (d.menu != null) ...[
          const SizedBox(width: 10),
          RoundBtn(
            icon: 'more',
            tip: context.l10n.actionMore,
            size: h,
            onTap: (ctx) => menuBelow(ctx, d.menu!(ctx)),
          ),
        ],
      ],
    );
  }
}

class _Top extends StatefulWidget {
  const _Top({required this.data});
  final ArtistData data;

  @override
  State<_Top> createState() => _TopState();
}

class _TopState extends State<_Top> {
  /// 热门歌曲默认 5 首，点「全部」展开。
  bool _all = false;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final d = widget.data;
    final l = d.latest;
    final hot = _all ? d.hot : d.hot.take(5).toList();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (l != null) ...[
          SizedBox(
            width: 400,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(context.l10n.artistLatestRelease),
                const SizedBox(height: 16),
                Tap(
                  onTap: () => app.go(l.route),
                  onMenu: l.menu == null
                      ? null
                      : (p) => showMenu(context, p, l.menu!(context)),
                  builder: (_, h, _) => CoverTone(
                    coverId: l.cover,
                    builder: (context, pal) => AnimatedSlide(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOutCubic,
                      offset: Offset(0, h ? -4 / 276 : 0),
                      child: Container(
                        width: 400,
                        height: 276,
                        padding: const EdgeInsets.all(22),
                        decoration: squircle(
                          28,
                          // 卡片底色取自最新专辑封面
                          color: pal.deep,
                          shadows: [
                            BoxShadow(
                              color: ba(h ? 0.5 : 0),
                              blurRadius: 40,
                              offset: const Offset(0, 16),
                              spreadRadius: -10,
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Cover(l.cover, w: 140, h: 140, r: 14),
                                const SizedBox(width: 22),
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      tx(
                                        l.kind.isEmpty
                                            ? context.l10n.albumKindAlbum
                                            : l.kind,
                                        12,
                                        w: w700,
                                        f: F.semi,
                                        c: wa(0.65),
                                      ),
                                      const SizedBox(height: 8),
                                      tx(l.date, 13, w: w600, c: wa(0.85)),
                                      const SizedBox(height: 4),
                                      tx(l.meta, 13, w: w600, c: wa(0.85)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Expanded(
                                  child: tx(
                                    l.title,
                                    26,
                                    w: w900,
                                    f: F.wide,
                                    c: white,
                                    lines: 2,
                                    h: 28 / 26,
                                  ),
                                ),
                                Tap(
                                  tip: context.l10n.actionPlay,
                                  tipOnCover: true,
                                  onTap: () => l.play?.call(app),
                                  builder: (_, hh, p) => PressScale(
                                    pressed: p,
                                    hover: hh,
                                    up: 1.08,
                                    child: Container(
                                      width: 56,
                                      height: 56,
                                      alignment: Alignment.center,
                                      decoration: const BoxDecoration(
                                        color: white,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Ico(
                                        'play',
                                        size: 24,
                                        color: darkInk,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 56),
        ],
        if (d.hot.isNotEmpty)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(
                  context.l10n.artistHotTracks,
                  allLabel: _all
                      ? context.l10n.actionCollapse
                      : context.l10n.actionAll,
                  onAll: d.hot.length > 5
                      ? () => setState(() => _all = !_all)
                      : null,
                ),
                const SizedBox(height: 14),
                Transform.translate(
                  offset: const Offset(-12, 0),
                  child: Column(
                    children: [
                      for (final (i, t) in hot.indexed)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: _HotRow(
                            i: i,
                            track: t,
                            onPlay: () => app.playList(
                              d.hot,
                              start: i,
                              name: context.l10n.artistHotTracksOf(d.name),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _HotRow extends StatelessWidget {
  const _HotRow({required this.i, required this.track, required this.onPlay});
  final int i;
  final Track track;
  final VoidCallback onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final current = app.track.key == track.key;
    final liked = app.liked.contains(track.key);
    void play() => current ? app.togglePlay() : onPlay();
    return LayoutBuilder(
      // 悬停底色左右各外扩 12，和设计稿一致；高度要给死，否则在滚动视图里纵向无界
      builder: (context, box) => SizedBox(
        height: 52,
        child: OverflowBox(
          alignment: Alignment.center,
          maxWidth: box.maxWidth + 24,
          minWidth: box.maxWidth + 24,
          child: Tap(
            onDoubleTap: play,
            onMenu: (p) => showMenu(context, p, trackMenu(context, track)),
            builder: (_, h, _) => AnimatedContainer(
              duration: fast,
              height: 52,
              padding: const EdgeInsets.fromLTRB(28, 0, 16, 0),
              decoration: squircle(
                14,
                color: h || current
                    ? P.surface
                    : P.surface.withValues(alpha: 0),
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 26,
                    child: Center(
                      child: tx(
                        '${i + 1}',
                        26,
                        w: w900,
                        f: F.wide,
                        c: current ? accent : (h ? P.ink : P.faint),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Cover(track.cover, w: 40, h: 40, r: 6),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        tx(
                          track.title,
                          15,
                          w: w700,
                          c: current ? accent : P.ink,
                        ),
                        const SizedBox(height: 3),
                        LinkText(
                          albumLinks(app, track),
                          style: ts(12, w: w500, c: P.muted),
                        ),
                      ],
                    ),
                  ),
                  if (h || liked)
                    Tap(
                      tip: liked
                          ? context.l10n.actionUnlike
                          : context.l10n.actionLike,
                      onTap: () => app.toggleLike(track),
                      builder: (_, hh, _) => Ico(
                        liked ? 'heart-filled' : 'heart',
                        size: 16,
                        color: liked ? heart : (hh ? P.ink : P.muted),
                      ),
                    ),
                  if (h) ...[
                    const SizedBox(width: 14),
                    Tap(
                      tip: current && app.playing
                          ? context.l10n.actionPause
                          : context.l10n.actionPlay,
                      onTap: play,
                      builder: (_, _, _) => Ico(
                        current && app.playing ? 'pause' : 'play',
                        size: 16,
                        color: P.ink,
                      ),
                    ),
                  ],
                  const SizedBox(width: 14),
                  tx(track.dur, 13, w: w600, c: P.faint, tnum: true),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DiscCard extends StatelessWidget {
  const _DiscCard({required this.d});
  final ArtistDisc d;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    return Tap(
      onTap: () => app.go(d.route),
      onMenu: d.menu == null
          ? null
          : (p) => showMenu(context, p, d.menu!(context)),
      builder: (_, h, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 1,
            child: ClipRSuperellipse(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AnimatedScale(
                    scale: h ? 1.05 : 1,
                    duration: const Duration(milliseconds: 400),
                    curve: smooth,
                    child: Cover(d.cover, w: 400, h: 400, r: 0),
                  ),
                  if (d.play != null)
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 140),
                        opacity: h ? 1 : 0,
                        child: AnimatedSlide(
                          duration: const Duration(milliseconds: 180),
                          offset: Offset(0, h ? 0 : 0.2),
                          child: Tap(
                            tip: context.l10n.actionPlay,
                            tipOnCover: true,
                            onTap: () => d.play!(app),
                            builder: (_, hh, p) => PressScale(
                              pressed: p,
                              hover: hh,
                              up: 1.08,
                              child: Container(
                                width: 44,
                                height: 44,
                                alignment: Alignment.center,
                                decoration: const BoxDecoration(
                                  color: white,
                                  shape: BoxShape.circle,
                                ),
                                child: const Padding(
                                  padding: EdgeInsets.only(left: 1),
                                  child: Ico('play', size: 20, color: darkInk),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          tx(d.title, 14, w: w700, f: F.semi),
          const SizedBox(height: 6),
          tx(d.year, 12, w: w600, c: P.faint),
        ],
      ),
    );
  }
}

/// 专辑一行超过一屏时的翻页按钮，一次翻一屏。
class _DiscPager extends StatefulWidget {
  const _DiscPager({super.key, required this.controller});
  final ScrollController controller;

  @override
  State<_DiscPager> createState() => _DiscPagerState();
}

class _DiscPagerState extends State<_DiscPager> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_tick);
  }

  @override
  void didUpdateWidget(_DiscPager old) {
    super.didUpdateWidget(old);
    // 换了 controller（比如切到另一个歌手）：监听跟着换
    if (old.controller != widget.controller) {
      old.controller.removeListener(_tick);
      widget.controller.addListener(_tick);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_tick);
    super.dispose();
  }

  void _tick() => setState(() {});

  void _page(int dir) {
    final c = widget.controller;
    if (!c.hasClients) return;
    final p = c.position;
    c.animateTo(
      (p.pixels + dir * (p.viewportDimension + 20)).clamp(0, p.maxScrollExtent),
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final ok = c.hasClients && c.position.hasContentDimensions;
    final atStart = !ok || c.position.pixels <= 0;
    final atEnd = ok && c.position.pixels >= c.position.maxScrollExtent - 1;
    return Row(
      children: [
        IconBtn(
          'chevron-left',
          size: BtnSize.s,
          tip: context.l10n.actionPrevPage,
          onTap: atStart ? null : () => _page(-1),
        ),
        const SizedBox(width: 4),
        IconBtn(
          'chevron-right',
          size: BtnSize.s,
          tip: context.l10n.actionNextPage,
          onTap: atEnd ? null : () => _page(1),
        ),
      ],
    );
  }
}
