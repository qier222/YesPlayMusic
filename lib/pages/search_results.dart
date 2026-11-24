import 'package:flutter/rendering.dart' show OverflowBoxFit;
import 'package:flutter/widgets.dart';

import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'library.dart' show HeartSmall;
import 'links.dart';
import 'remote.dart' show errorText;

int _tab = 0; // 跨页面保留

/// 插件的搜索结果，按定稿「搜索（v8）」排：
/// 全部 / 歌曲 / 专辑 / 歌手 / 歌单 五个分类；「全部」左边歌曲和专辑，右边歌手和歌单。
class SearchResults extends StatefulWidget {
  const SearchResults({
    super.key,
    required this.source,
    required this.query,
    required this.onHit,
  });
  final String source, query;

  /// 从结果里点开了一样东西。
  final void Function(SearchHit) onHit;

  @override
  State<SearchResults> createState() => _SearchResultsState();
}

class _SearchResultsState extends State<SearchResults> {
  static const _kinds = [
    m.SearchKind.tracks,
    m.SearchKind.albums,
    m.SearchKind.artists,
    m.SearchKind.playlists,
  ];

  final _res = <m.SearchKind, m.SearchResult>{};
  final _busy = <m.SearchKind>{};
  Object? _error;
  bool _done = false;
  final _follow = <String, bool>{};

  Source? get _src => context.appRead.sources[widget.source];

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    final s = _src;
    if (s == null) return;
    final rs = await Future.wait([
      for (final k in _kinds)
        s.search(widget.query, k).then<Object>((r) => r, onError: (e) => e),
    ]);
    if (!mounted) return;
    setState(() {
      _done = true;
      for (final (i, r) in rs.indexed) {
        if (r is m.SearchResult) {
          _res[_kinds[i]] = r;
        } else {
          _error ??= r;
        }
      }
      // 四类都失败才算出错
      if (_res.isNotEmpty) _error = null;
    });
    final ts = _res[m.SearchKind.tracks]?.tracks ?? const [];
    if (ts.isNotEmpty) context.appRead.checkLiked(_tracks(ts));
  }

  Future<void> _more(m.SearchKind k) async {
    final s = _src, prev = _res[k];
    if (s == null || prev == null || _busy.contains(k)) return;
    setState(() => _busy.add(k));
    try {
      final r = await s.search(widget.query, k, offset: _len(prev, k));
      if (!mounted) return;
      setState(() {
        _res[k] = m.SearchResult(
          tracks: [...prev.tracks, ...r.tracks],
          albums: [...prev.albums, ...r.albums],
          artists: [...prev.artists, ...r.artists],
          playlists: [...prev.playlists, ...r.playlists],
          more: r.more,
          total: prev.total,
        );
      });
    } catch (e) {
      showToast(errorText(e));
    } finally {
      if (mounted) setState(() => _busy.remove(k));
    }
  }

  static int _len(m.SearchResult r, m.SearchKind k) => switch (k) {
    m.SearchKind.tracks => r.tracks.length,
    m.SearchKind.albums => r.albums.length,
    m.SearchKind.artists => r.artists.length,
    m.SearchKind.playlists => r.playlists.length,
    m.SearchKind.shows => 0,
  };

  int _count(m.SearchKind k) {
    final r = _res[k];
    if (r == null) return 0;
    return r.total > 0 ? r.total : _len(r, k);
  }

  List<Track> _tracks(List<m.Track> ts) => [
    for (final t in ts)
      Track.of(t.source.isEmpty ? t.withSource(widget.source) : t),
  ];

  @override
  Widget build(BuildContext context) {
    // 加载中：屏幕中间转圈（和「没有找到」同一个位置）
    if (!_done) {
      return const Align(alignment: Alignment(0, -0.25), child: Spinner());
    }
    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.only(top: 40),
        child: tx(errorText(_error!), 15, w: w600, c: P.faint),
      );
    }
    final l = context.l10n;
    final total = _kinds.fold(0, (n, k) => n + _count(k));
    if (total == 0) {
      return Align(
        alignment: const Alignment(0, -0.25),
        child: tx(
          l.searchNoResults(widget.query),
          24,
          w: w700,
          f: F.semi,
          lines: 2,
          align: TextAlign.center,
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 22),
        LineTabs(
          items: [
            (l.actionAll, null),
            (l.tabSongs, '${_count(m.SearchKind.tracks)}'),
            (l.tabAlbums, '${_count(m.SearchKind.albums)}'),
            (l.tabArtistSearch, '${_count(m.SearchKind.artists)}'),
            (l.tabPlaylists, '${_count(m.SearchKind.playlists)}'),
          ],
          selected: _tab,
          onChanged: (i) => setState(() => _tab = i),
        ),
        Expanded(
          child: AnimatedSwitcher(
            transitionBuilder: fadeOnly,
            duration: const Duration(milliseconds: 220),
            child: _tabBody(),
          ),
        ),
      ],
    );
  }

  Widget _tabBody() {
    if (_tab > 0) {
      final kind = _kinds[_tab - 1];
      final result = _res[kind];
      if (result != null && _count(kind) == 0 && !result.more) {
        final l = context.l10n;
        final title = switch (kind) {
          m.SearchKind.tracks => l.searchNoSongs,
          m.SearchKind.albums => l.searchNoAlbums,
          m.SearchKind.artists => l.searchNoArtists,
          m.SearchKind.playlists => l.searchNoPlaylists,
          m.SearchKind.shows => throw StateError('搜索页没有节目分类'),
        };
        return Align(
          key: ValueKey(_tab),
          alignment: const Alignment(0, -0.3),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: EmptyMessage(title: title),
          ),
        );
      }
    }
    return SingleChildScrollView(
      key: ValueKey(_tab),
      padding: const EdgeInsets.fromLTRB(0, 24, 0, 200),
      child: _body(),
    );
  }

  Widget _body() {
    final l = context.l10n;
    final r = _res;
    final songs = _tracks(r[m.SearchKind.tracks]?.tracks ?? const []);
    final albums = r[m.SearchKind.albums]?.albums ?? const <m.Album>[];
    final artists = r[m.SearchKind.artists]?.artists ?? const <m.Artist>[];
    final lists = r[m.SearchKind.playlists]?.playlists ?? const <m.Playlist>[];
    Widget more(m.SearchKind k) => r[k]?.more ?? false
        ? Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Btn(
              label: _busy.contains(k) ? l.stateLoadingShort : l.actionLoadMore,
              size: BtnSize.m,
              kind: BtnKind.secondary,
              enabled: !_busy.contains(k),
              onTap: () => _more(k),
            ),
          )
        : const SizedBox.shrink();

    switch (_tab) {
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [_songs(songs, songs.length), more(m.SearchKind.tracks)],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [_albums(albums, albums.length), more(m.SearchKind.albums)],
        );
      case 3:
        return SizedBox(
          width: 600,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _artists(artists, artists.length),
              more(m.SearchKind.artists),
            ],
          ),
        );
      case 4:
        return SizedBox(
          width: 600,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _playlists(lists, lists.length),
              more(m.SearchKind.playlists),
            ],
          ),
        );
    }
    final nSongs = _count(m.SearchKind.tracks),
        nAlbums = _count(m.SearchKind.albums);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (songs.isNotEmpty) ...[
                _header(l.tabSongs),
                const SizedBox(height: 8),
                _songs(songs, 5),
                if (nSongs > 5)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: _seeAll(
                      l.searchViewAllSongs(nSongs),
                      () => setState(() => _tab = 1),
                    ),
                  ),
                const SizedBox(height: 28),
              ],
              if (albums.isNotEmpty) ...[
                _header(l.tabAlbums),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (_, c) => _albums(
                    albums,
                    ((c.maxWidth + 16) / (124 + 16)).floor().clamp(1, 8),
                  ),
                ),
                if (nAlbums > albums.length.clamp(0, 6))
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: _seeAll(
                      l.searchViewAllAlbums(nAlbums),
                      () => setState(() => _tab = 2),
                    ),
                  ),
              ],
            ],
          ),
        ),
        if (artists.isNotEmpty || lists.isNotEmpty) ...[
          const SizedBox(width: 32),
          SizedBox(
            width: 428,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (artists.isNotEmpty) ...[
                  _header(
                    l.tabArtistSearch,
                    right: _seeAll(
                      l.searchAllCount(_count(m.SearchKind.artists)),
                      () => setState(() => _tab = 3),
                      chevron: true,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _artists(artists, 2),
                  const SizedBox(height: 14),
                ],
                if (lists.isNotEmpty) ...[
                  _header(
                    l.tabPlaylists,
                    right: _seeAll(
                      l.searchAllCount(_count(m.SearchKind.playlists)),
                      () => setState(() => _tab = 4),
                      chevron: true,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _playlists(lists, 4),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _header(String title, {Widget? right}) => SizedBox(
    height: 32,
    child: Row(
      children: [
        tx(title, 18, w: w700, f: F.semi),
        const Spacer(),
        ?right,
      ],
    ),
  );

  Widget _seeAll(String label, VoidCallback onTap, {bool chevron = false}) =>
      Tap(
        onTap: onTap,
        builder: (_, h, _) => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            tx(label, 13, w: w700, f: F.semi, c: h ? P.ink : P.muted),
            if (chevron) ...[
              const SizedBox(width: 4),
              Ico('chevron-right', size: 12, color: h ? P.ink : P.muted),
            ],
          ],
        ),
      );

  // ── 歌曲 ──

  Widget _songs(List<Track> songs, int limit) {
    final shown = songs.take(limit).toList();
    // 行的悬停底色比文字往左右各多出 8
    return Transform.translate(
      offset: const Offset(-8, 0),
      child: LayoutBuilder(
        // 放在滚动区里高度不限：按内容的高度，不要撑满
        builder: (context, c) => OverflowBox(
          fit: OverflowBoxFit.deferToChild,
          alignment: Alignment.topLeft,
          minWidth: c.maxWidth + 16,
          maxWidth: c.maxWidth + 16,
          child: Column(
            children: [
              for (final (i, t) in shown.indexed)
                FadeIn(
                  delay: i * 25,
                  child: _SongRow(
                    track: t,
                    list: songs,
                    name: context.l10n.searchQueueName(widget.query),
                    onPlay: () => widget.onHit(SearchHit.ofTrack(t.ref!)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ── 专辑 ──

  Widget _albums(List<m.Album> list, int limit) {
    final app = context.appRead;
    return Wrap(
      spacing: 16,
      runSpacing: 20,
      children: [
        for (final (i, a) in list.take(limit).indexed)
          FadeIn(
            delay: i * 30,
            child: Tap(
              onTap: () {
                widget.onHit(
                  SearchHit(
                    kind: 'album',
                    source: widget.source,
                    id: a.id,
                    title: a.name,
                    sub: a.artists.map((x) => x.name).join(', '),
                    cover: a.imageUrl,
                  ),
                );
                app.go(AppState.remoteRoute('album', widget.source, a.id));
              },
              builder: (_, h, _) => SizedBox(
                width: 124,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRSuperellipse(
                      borderRadius: BorderRadius.circular(12),
                      child: AnimatedScale(
                        scale: h ? 1.06 : 1,
                        duration: const Duration(milliseconds: 400),
                        curve: smooth,
                        child: Cover(a.imageUrl, w: 124, h: 124, r: 0),
                      ),
                    ),
                    const SizedBox(height: 8),
                    tx(a.name, 13, w: w700, f: F.semi),
                    if (a.year != null) ...[
                      const SizedBox(height: 2),
                      tx('${a.year}', 12, w: w600, c: P.faint, tnum: true),
                    ],
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  // ── 歌手 ──

  Widget _artists(List<m.Artist> list, int limit) {
    final app = context.app;
    final s = _src;
    final canFollow = s != null && s.can(Op.followArtist);
    return Column(
      children: [
        for (final a in list.take(limit))
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Tap(
              onTap: () {
                widget.onHit(
                  SearchHit(
                    kind: 'artist',
                    source: widget.source,
                    id: a.id,
                    title: a.name,
                    cover: a.imageUrl,
                  ),
                );
                app.go(AppState.remoteRoute('artist', widget.source, a.id));
              },
              builder: (_, h, p) => Row(
                children: [
                  PressScale(
                    pressed: p,
                    hover: h,
                    up: 1.06,
                    child: Cover(a.imageUrl, w: 48, h: 48, r: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: tx(a.name, 15, w: w700, f: F.semi),
                  ),
                  if (canFollow)
                    Builder(
                      builder: (_) {
                        final on = _follow[a.id] ?? a.following;
                        return Btn(
                          label: on
                              ? context.l10n.actionFollowing
                              : context.l10n.actionFollow,
                          icon: on ? 'check' : null,
                          size: BtnSize.s,
                          kind: BtnKind.secondary,
                          onTap: () async {
                            setState(() => _follow[a.id] = !on);
                            try {
                              await s.followArtist(a.id, !on);
                            } catch (e) {
                              if (mounted) setState(() => _follow[a.id] = on);
                              showToast(errorText(e));
                            }
                          },
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // ── 歌单 ──

  Widget _playlists(List<m.Playlist> list, int limit) {
    final app = context.appRead;
    return Transform.translate(
      offset: const Offset(-8, 0),
      child: LayoutBuilder(
        // 放在滚动区里高度不限：按内容的高度，不要撑满
        builder: (context, c) => OverflowBox(
          fit: OverflowBoxFit.deferToChild,
          alignment: Alignment.topLeft,
          minWidth: c.maxWidth + 16,
          maxWidth: c.maxWidth + 16,
          child: Column(
            children: [
              for (final p in list.take(limit))
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Tap(
                    onTap: () {
                      widget.onHit(
                        SearchHit(
                          kind: 'playlist',
                          source: widget.source,
                          id: p.id,
                          title: p.name,
                          sub: p.owner,
                          cover: p.imageUrl,
                        ),
                      );
                      app.go(
                        AppState.remoteRoute('playlist', widget.source, p.id),
                      );
                    },
                    builder: (_, h, _) => AnimatedContainer(
                      duration: const Duration(milliseconds: 100),
                      height: 56,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: squircle(
                        12,
                        color: h ? P.surface : P.surface.withValues(alpha: 0),
                      ),
                      child: Row(
                        children: [
                          Cover(p.imageUrl, w: 44, h: 44, r: 8),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                tx(p.name, 15, w: w700, f: F.semi),
                                if (_meta(p).isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  tx(_meta(p), 13, w: w500, c: P.muted),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  static String _meta(m.Playlist p) => p.owner.isNotEmpty
      ? p.owner
      : (p.trackCount > 0 ? L.countTracks(p.trackCount) : '');
}

/// 一行歌：封面（悬停出播放）、歌名和艺人、专辑、年份、爱心、时长。
class _SongRow extends StatelessWidget {
  const _SongRow({
    required this.track,
    required this.list,
    required this.name,
    required this.onPlay,
  });
  final Track track;
  final List<Track> list;
  final String name;
  final VoidCallback onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = track;
    final off = t.ref?.unavailable ?? false;
    final current = app.track.key == t.key;
    final liked = app.liked.contains(t.key);
    final year = t.ref?.album.year;
    void play() {
      if (off) return;
      if (current) return app.togglePlay();
      final ok = list.where((x) => !(x.ref?.unavailable ?? false)).toList();
      app.playList(ok, start: ok.indexOf(t), name: name);
      onPlay();
    }

    return Tap(
      onDoubleTap: play,
      onMenu: (p) => showMenu(context, p, trackMenu(context, t)),
      builder: (_, h, _) => AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: squircle(
          14,
          color: h || current ? P.surface : P.surface.withValues(alpha: 0),
        ),
        child: Opacity(
          opacity: off ? 0.4 : 1,
          child: Row(
            children: [
              SizedBox(
                width: 40,
                height: 40,
                child: Stack(
                  children: [
                    Cover(t.cover, w: 40, h: 40, r: 8),
                    if (h && !off)
                      Tap(
                        tip: current && app.playing
                            ? context.l10n.actionPause
                            : context.l10n.actionPlay,
                        onTap: play,
                        builder: (_, _, _) => Container(
                          alignment: Alignment.center,
                          decoration: squircle(8, color: ba(0.5)),
                          child: Ico(
                            current && app.playing ? 'pause' : 'play',
                            size: 16,
                            color: white,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 5,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(
                      t.title,
                      15,
                      w: w700,
                      f: F.semi,
                      c: current ? accent : P.ink,
                    ),
                    const SizedBox(height: 3),
                    LinkText(
                      joinLinks([artistLinks(app, t)]),
                      style: ts(13, w: w500, c: P.muted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 3,
                child: LinkText(
                  albumLinks(app, t),
                  style: ts(13, w: w500, c: P.muted),
                ),
              ),
              SizedBox(
                width: 80,
                child: tx(
                  year == null ? '' : '$year',
                  13,
                  w: w500,
                  c: P.faint,
                  tnum: true,
                ),
              ),
              if ((h && !off) || liked) ...[
                HeartSmall(liked: liked, onTap: () => app.toggleLike(t)),
                const SizedBox(width: 8),
              ],
              SizedBox(
                width: 40,
                child: tx(
                  t.dur,
                  13,
                  w: w500,
                  c: P.faint,
                  tnum: true,
                  align: TextAlign.right,
                ),
              ),
              const SizedBox(width: 2),
            ],
          ),
        ),
      ),
    );
  }
}
