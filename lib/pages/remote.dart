// Pages for plugin sources: library (plugin home), search, album, artist, playlist.
//
// Local music pages have much custom layout per the design; plugin data has a uniform shape (models.dart),
// so one generic layout here is shared by all plugins.

import 'dart:async';

import 'package:flutter/widgets.dart';

import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../music/models.dart' as m;
import '../cache/requests.dart';
import '../music/source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'album.dart';
import 'artist.dart';
import 'common.dart';
import 'home_sections.dart';
import 'home_skeleton.dart';
import 'library.dart' show addedText;
import 'playlist.dart';
import 'search_idle.dart';
import 'page_skeletons.dart';
import 'search_results.dart';
import 'links.dart';

// ───── Loading ─────

/// Loads data from a plugin: loading, error (retryable), done. Results are cached in AppState by [cacheKey].
class Loaded<T> extends StatefulWidget {
  const Loaded({
    super.key,
    required this.req,
    required this.builder,
    this.placeholder,
    this.frame,
    this.onData,
  });

  /// The data wanted: shown immediately if cached (even stale, refetched in the background), otherwise fetched.
  final DataReq<T> req;
  final Widget Function(BuildContext context, T value) builder;

  /// What to show while loading (e.g. a skeleton); when given, it cross-fades with the content.
  final Widget? placeholder;

  /// An extra wrapper around the error message (e.g. adding the page title).
  final Widget Function(Widget child)? frame;

  /// Called once for each new piece of data (first time, or a background refetch), before builder.
  final void Function(T value)? onData;

  @override
  State<Loaded<T>> createState() => _LoadedState<T>();
}

class _LoadedState<T> extends State<Loaded<T>> {
  // Content is always built directly with builder; a background refetch swaps in place without going back to the skeleton or replaying
  // the entrance animation.
  Object? _error;
  bool _loading = false;
  Object? _seen;

  void _load() {
    if (_loading) return;
    _loading = true;
    _error = null;
    context.appRead
        .loadData(widget.req)
        .then(
          (_) {
            if (mounted) setState(() => _loading = false);
          },
          onError: (Object e) {
            if (!mounted) return;
            setState(() {
              _loading = false;
              _error = e;
            });
          },
        );
  }

  @override
  void didUpdateWidget(Loaded<T> old) {
    super.didUpdateWidget(old);
    if (old.req.source != widget.req.source ||
        old.req.path != widget.req.path) {
      _error = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Also reached when the key changes after switching accounts: fetch if the new account has no cache
    final v = context.app.peekData(widget.req);
    if (v == null && !_loading && _error == null) _load();
    if (v != null && !identical(v, _seen)) {
      _seen = v;
      widget.onData?.call(v);
    }
    final ph = widget.placeholder;
    if (ph == null) return _body(v, Notice(context.l10n.stateLoading));
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 260),
      switchInCurve: Curves.easeOut,
      layoutBuilder: (cur, prev) =>
          Stack(alignment: Alignment.topLeft, children: [...prev, ?cur]),
      child: KeyedSubtree(
        key: ValueKey(v != null ? 1 : (_error != null ? 2 : 0)),
        child: _body(v, ph),
      ),
    );
  }

  Widget _body(T? v, Widget loading) {
    if (v != null) return widget.builder(context, v);
    if (_error != null) {
      final n = Notice(
        errorText(_error!),
        action: context.l10n.actionRetry,
        onAction: () => setState(() => _error = null),
      );
      return widget.frame?.call(n) ?? n;
    }
    return loading;
  }
}

String errorText(Object e) => switch (e) {
  SourceError(kind: SourceErrorKind.signIn, :final reason) =>
    reason.isEmpty ? L.remoteNeedSignIn : reason,
  SourceError(:final reason) when reason.isNotEmpty => reason,
  SourceError(:final kind) => L.remoteErrorKind(kind.name),
  _ => '$e',
};

/// A message on the page, optionally with a button.
class Notice extends StatelessWidget {
  const Notice(this.text, {super.key, this.action, this.onAction});
  final String text;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 48),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: tx(text, 15, w: w600, c: P.faint, lines: 4, h: 1.5),
        ),
        if (action != null) ...[
          const SizedBox(height: 16),
          Btn(
            label: action!,
            size: BtnSize.m,
            kind: BtnKind.secondary,
            onTap: onAction,
          ),
        ],
      ],
    ),
  );
}

Source? _src(BuildContext context, String id) => context.app.sources[id];

Widget _missing(String id) => Notice(L.remotePluginMissing(id));

/// Song list from a plugin: fill in the source and convert to UI Tracks.
List<Track> _tracks(List<m.Track> ts, String source) => [
  for (final t in ts) Track.of(t.source.isEmpty ? t.withSource(source) : t),
];

// ───── Common widgets ─────

/// The cover; a plain background when the plugin gives no image.
class Art extends StatelessWidget {
  const Art(this.url, {super.key, required this.size, this.round = false});
  final String url;
  final double size;
  final bool round;

  @override
  Widget build(BuildContext context) {
    final r = round ? size / 2 : size * 0.06 + 4;
    if (url.isEmpty) {
      return Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: squircle(r, color: P.raised),
        child: Ico(round ? 'user' : 'music', size: size / 4, color: P.faint),
      );
    }
    return Cover(url, w: size, h: size, r: r);
  }
}

/// Page scaffold: scrollable, horizontal margins, room at the bottom for the player bar.
class _Scroll extends StatelessWidget {
  const _Scroll({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.fromLTRB(40, 20, 40, 140),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    ),
  );
}

Widget _heading(String s) => Padding(
  padding: const EdgeInsets.only(top: 36, bottom: 14),
  child: tx(s, 20, w: w700, f: F.semi),
);

/// Song list, in two columns when wide. Tapping a song replaces the queue with the whole list.
class TrackList extends StatelessWidget {
  const TrackList(
    this.tracks, {
    super.key,
    this.numbered = false,
    this.name = '',
    this.from = '',
    this.onPlay,
  });
  final List<Track> tracks;
  final bool numbered;

  /// After a song is double-clicked to play (the search page uses it to remember opened results).
  final void Function(Track)? onPlay;

  /// [AppState.queueName] / [AppState.queueFrom] when a song is double-clicked to play.
  final String name, from;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, c) {
      final cols = c.maxWidth > 900 ? 2 : 1;
      final w = (c.maxWidth - 22 * (cols - 1)) / cols;
      final per = (tracks.length + cols - 1) ~/ cols;
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var col = 0; col < cols; col++) ...[
            if (col > 0) const SizedBox(width: 22),
            SizedBox(
              width: w,
              child: Column(
                children: [
                  for (
                    var i = col * per;
                    i < (col + 1) * per && i < tracks.length;
                    i++
                  )
                    _TrackRow(
                      list: tracks,
                      i: i,
                      numbered: numbered,
                      name: name,
                      from: from,
                      onPlay: onPlay,
                    ),
                ],
              ),
            ),
          ],
        ],
      );
    },
  );
}

class _TrackRow extends StatelessWidget {
  const _TrackRow({
    required this.list,
    required this.i,
    required this.numbered,
    required this.name,
    required this.from,
    this.onPlay,
  });
  final List<Track> list;
  final int i;
  final String name, from;
  final bool numbered;
  final void Function(Track)? onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = list[i];
    final off = t.ref?.unavailable ?? false;
    final current = app.track.key == t.key;
    void play() {
      if (current) return app.togglePlay();
      // Songs that can't be played don't go into the queue.
      final ok = list.where((x) => !(x.ref?.unavailable ?? false)).toList();
      app.playList(ok, start: ok.indexOf(t), name: name, from: from);
      onPlay?.call(t);
    }

    return Tap(
      onDoubleTap: off ? null : play,
      onMenu: (p) => showMenu(context, p, trackMenu(context, t)),
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        height: 58,
        margin: const EdgeInsets.only(bottom: 2),
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(
          12,
          color: current
              ? (P.dark ? wa(0.08) : ba(0.05))
              : (h && !off
                    ? (P.dark ? wa(0.05) : ba(0.03))
                    : const Color(0x00000000)),
        ),
        child: Opacity(
          opacity: off ? 0.4 : 1,
          child: Row(
            children: [
              if (numbered) ...[
                RowIndex(
                  n: i + 1,
                  hover: h && !off,
                  current: current,
                  playing: app.playing,
                  width: 26,
                  align: Alignment.center,
                  onTap: off ? null : play,
                ),
                const SizedBox(width: 10),
              ] else ...[
                Art(t.cover, size: 40),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(t.title, 15, w: w700, c: current ? accent : P.ink),
                    const SizedBox(height: 3),
                    LinkText(
                      joinLinks([artistLinks(app, t)]),
                      style: ts(12, w: w500, c: P.muted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              if (t.seconds > 0) tx(t.dur, 13, w: w600, c: P.faint, tnum: true),
            ],
          ),
        ),
      ),
    );
  }
}

/// Card for an album, artist or playlist.
class _Card extends StatelessWidget {
  const _Card({
    required this.image,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.round = false,
  });
  final String image, title, subtitle;
  final VoidCallback onTap;
  final bool round;

  static const width = 168.0;

  @override
  Widget build(BuildContext context) => Tap(
    onTap: onTap,
    builder: (_, h, _) => SizedBox(
      width: width,
      child: Column(
        crossAxisAlignment: round
            ? CrossAxisAlignment.center
            : CrossAxisAlignment.start,
        children: [
          AnimatedScale(
            duration: fast,
            scale: h ? 1.03 : 1,
            child: Art(image, size: width, round: round),
          ),
          const SizedBox(height: 10),
          tx(title, 14, w: w700, lines: 2, h: 1.3, c: h ? accent : P.ink),
          if (subtitle.isNotEmpty) ...[
            const SizedBox(height: 3),
            tx(subtitle, 12, w: w500, c: P.muted),
          ],
        ],
      ),
    ),
  );
}

Widget _cards(List<Widget> cards) =>
    Wrap(spacing: 20, runSpacing: 24, children: cards);

List<Widget> _albumCards(
  BuildContext context,
  String src,
  List<m.Album> xs, {
  void Function(SearchHit)? hit,
}) => [
  for (final a in xs)
    _Card(
      image: a.imageUrl,
      title: a.name,
      subtitle: a.artists.map((x) => x.name).join(', '),
      onTap: () {
        hit?.call(
          SearchHit(
            kind: 'album',
            source: src,
            id: a.id,
            title: a.name,
            sub: a.artists.map((x) => x.name).join(', '),
            cover: a.imageUrl,
          ),
        );
        context.appRead.go(AppState.remoteRoute('album', src, a.id));
      },
    ),
];

List<Widget> _artistCards(
  BuildContext context,
  String src,
  List<m.Artist> xs, {
  void Function(SearchHit)? hit,
}) => [
  for (final a in xs)
    _Card(
      image: a.imageUrl,
      title: a.name,
      subtitle: '',
      round: true,
      onTap: () {
        hit?.call(
          SearchHit(
            kind: 'artist',
            source: src,
            id: a.id,
            title: a.name,
            cover: a.imageUrl,
          ),
        );
        context.appRead.go(AppState.remoteRoute('artist', src, a.id));
      },
    ),
];

List<Widget> _playlistCards(
  BuildContext context,
  String src,
  List<m.Playlist> xs, {
  void Function(SearchHit)? hit,
}) => [
  for (final p in xs)
    _Card(
      image: p.imageUrl,
      title: p.name,
      subtitle: p.owner.isNotEmpty
          ? p.owner
          : (p.trackCount > 0 ? context.l10n.countTracks(p.trackCount) : ''),
      onTap: () {
        hit?.call(
          SearchHit(
            kind: 'playlist',
            source: src,
            id: p.id,
            title: p.name,
            sub: p.owner,
            cover: p.imageUrl,
          ),
        );
        context.appRead.go(AppState.remoteRoute('playlist', src, p.id));
      },
    ),
];

/// A home section: title plus a song list and cards.
List<Widget> _section(BuildContext context, String src, m.Section s) => [
  if (s.title.isNotEmpty) _heading(s.title),
  if (s.tracks.isNotEmpty) TrackList(_tracks(s.tracks, src), name: s.title),
  if (s.albums.isNotEmpty ||
      s.artists.isNotEmpty ||
      s.playlists.isNotEmpty) ...[
    if (s.tracks.isNotEmpty) const SizedBox(height: 20),
    _cards([
      ..._albumCards(context, src, s.albums),
      ..._playlistCards(context, src, s.playlists),
      ..._artistCards(context, src, s.artists),
    ]),
  ],
];

// ───── Library (plugin home) ─────

/// Date line at the top of the home page (formatted for the current locale).
String dateLine(DateTime d, Locale locale) => formatHomeDate(d, locale);

/// Greeting by time of day.
String greet(DateTime d, AppLocalizations l) => switch (d.hour) {
  < 5 => l.greetingLateNight,
  < 11 => l.greetingMorning,
  < 13 => l.greetingNoon,
  < 18 => l.greetingAfternoon,
  _ => l.greetingEvening,
};

class RemoteHomePage extends StatelessWidget {
  const RemoteHomePage({
    super.key,
    required this.source,
    this.title,
    this.discover = false,
    this.greeting = false,
  });
  final String source;

  /// Home page: the title becomes "Sunday, November 22" and "Good afternoon, name".
  final bool greeting;

  /// Discover page: uses the plugin's browse, or shows a message if missing. Otherwise the home page (the plugin's home).
  final bool discover;

  String get _key => discover ? '$source/discover' : source;

  /// Large page title; when empty, the plugin name, with a note below that it comes from the plugin.
  final String? title;

  /// "style:count" for each section in the skeleton.
  static String? _spec(m.Section x) => switch (x.style) {
    'modes' => 'modes:${x.modes.length}',
    'shelf' =>
      'shelf:${x.playlists.length + x.albums.length + x.tracks.length}',
    'songs' => 'songs:${x.tracks.length}',
    'charts' => 'charts:${x.playlists.length}',
    'grid' =>
      '${x.title.isEmpty ? 'grid' : 'grid+'}:'
          '${x.playlists.length + x.albums.length + x.artists.length}',
    _ => null,
  };

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final locale = Localizations.localeOf(context);
    final s = _src(context, source);
    final name = app.accounts[source]?.name ?? '';
    final now = DateTime.now();
    final g = greet(now, l);
    final sep = (locale.languageCode == 'zh' || locale.languageCode == 'ja')
        ? '，'
        : ', ';
    final head = [
      const SizedBox(height: 20),
      if (greeting) ...[
        tx(dateLine(now, locale), 15, w: w700, c: P.faint),
        const SizedBox(height: 4),
        tx(name.isEmpty ? g : '$g$sep$name', 44, w: w900, f: F.wide),
      ] else
        tx(title ?? s?.info.name ?? source, 44, w: w900, f: F.wide),
      if (title == null && !greeting) ...[
        const SizedBox(height: 6),
        tx(l.remoteSwitchToLocalHint, 13, w: w600, c: P.faint),
      ],
    ];
    // Plugin not loaded yet: show the skeleton first
    if (s == null && !app.pluginsLoaded) {
      return HomeSkeleton(head: head, layout: app.homeLayout(_key));
    }
    if (s == null) return _Scroll(children: [...head, _missing(source)]);
    if (!s.can(discover ? Op.browse : Op.home)) {
      return _Scroll(
        children: [
          ...head,
          Notice(discover ? l.remoteNoDiscover : l.remoteNoHome),
        ],
      );
    }
    if (discover) return _Discover(source: source, head: head);
    return Loaded<m.Browse>(
      req: DataReq.home(source),
      placeholder: HomeSkeleton(head: head, layout: app.homeLayout(_key)),
      frame: (n) => _Scroll(children: [...head, n]),
      builder: (context, b) =>
          _BrowseBody(source: source, layoutKey: _key, browse: b, head: head),
    );
  }
}

/// Content of the home and Discover pages: recognised components drawn per the final design, others as the old list and cards.
class _BrowseBody extends StatelessWidget {
  const _BrowseBody({
    required this.source,
    required this.layoutKey,
    required this.browse,
    required this.head,
  });
  final String source, layoutKey;
  final m.Browse browse;
  final List<Widget> head;

  @override
  Widget build(BuildContext context) => _Scroll(
    children: [...head, ...browseSections(context, source, layoutKey, browse)],
  );
}

/// Page sections; the layout is remembered for the next skeleton. A message when there's no content.
List<Widget> browseSections(
  BuildContext context,
  String source,
  String layoutKey,
  m.Browse browse, {
  String? family,
}) {
  final secs = browse.sections
      .where(
        (x) =>
            x.modes.isNotEmpty ||
            x.tracks.isNotEmpty ||
            x.albums.isNotEmpty ||
            x.artists.isNotEmpty ||
            x.playlists.isNotEmpty,
      )
      .toList();
  if (secs.isEmpty) return [Notice(context.l10n.remoteNoContent)];
  final layout = [
    for (final x in secs)
      if (homeSection(source, x) != null) ?RemoteHomePage._spec(x),
  ];
  context.appRead.rememberHomeLayout(layoutKey, layout);
  if (family != null) context.appRead.rememberHomeLayout(family, layout);
  return [
    for (final x in secs)
      if (homeSection(source, x) case final w?)
        Padding(
          padding: EdgeInsets.only(top: x == secs.first ? 32 : 48),
          child: w,
        )
      else
        ..._section(context, source, x),
  ];
}

// ───── Discover page: top tabs, sub-tabs ─────

/// The plugin's Discover page (browse). With tabs, a row of tabs is drawn below the title; with filters,
/// rows of labels below the tabs; tapping fetches again with the option's page.
class _Discover extends StatefulWidget {
  const _Discover({required this.source, required this.head});
  final String source;
  final List<Widget> head;

  @override
  State<_Discover> createState() => _DiscoverState();
}

class _DiscoverState extends State<_Discover> {
  /// The page being viewed; empty is the plugin's default page.
  String _page = '';

  /// The current tab's page; the skeleton layout is remembered by it (sub-tabs aren't remembered separately).
  String _tab = '';

  /// Content fetched for the current page; null while loading.
  m.Browse? _cur;
  Object? _error;
  int _serial = 0;

  /// The last fetched page: while loading a new one, tabs and labels are drawn from it so nothing jumps.
  m.Browse? _last;

  /// The new page came from tapping a label: keep the labels while loading.
  bool _fromFilter = false;

  /// The top group card expanded to all categories.
  bool _expanded = false;

  /// The "More categories" panel is open.
  bool _more = false;

  String get _cacheKey => _page.isEmpty
      ? '${widget.source}/browse'
      : '${widget.source}/browse:$_page';

  // The default page (opened at launch) is remembered separately, since the tab isn't known yet then
  String get _layoutKey => _page.isEmpty || _tab.isEmpty
      ? '${widget.source}/discover'
      : '${widget.source}/discover:$_tab';

  String get _barsKey => '$_layoutKey#bars';

  // Tabs of the same kind (same part before the colon in page, e.g. style:欧美 and style:爵士) share a structure:
  // the first time a tab opens, draw the skeleton from how a tab of the same kind last looked
  String? get _familyKey {
    final i = _tab.indexOf(':');
    if (_page.isEmpty || i < 0) return null;
    return '${widget.source}/discover:${_tab.substring(0, i)}';
  }

  List<String> _layoutOf(String key, String? family) {
    final app = context.appRead;
    return app.savedHomeLayout(key) ??
        (family == null ? null : app.savedHomeLayout(family)) ??
        app.homeLayout(key);
  }

  void _remember(String key, String? family, List<String> layout) {
    final app = context.appRead;
    app.rememberHomeLayout(key, layout);
    if (family != null) app.rememberHomeLayout(family, layout);
  }

  // The top categories and labels are always the same widget; only the content below switches between skeleton and page:
  // that way tapping a tab scrolls the category row smoothly instead of rebuilding the whole block.
  DataReq<m.Browse> get _req => DataReq.browse(widget.source, _page);

  void _load() {
    final app = context.appRead;
    _error = null;
    final have = app.peekData(_req);
    if (have != null) {
      _got(have);
      return;
    }
    _cur = null;
    final serial = ++_serial;
    if (app.sources[widget.source] == null) return;
    app
        .loadData(_req)
        .then(
          (v) {
            if (mounted && serial == _serial) setState(() => _got(v));
          },
          onError: (Object e) {
            if (mounted && serial == _serial) setState(() => _error = e);
          },
        );
  }

  void _got(m.Browse b) {
    _cur = b;
    _last = b;
    for (final t in b.tabs) {
      if (t.selected) _tab = t.page;
    }
    final f = _familyKey;
    _remember(_barsKey, f == null ? null : '$f#bars', [
      'chips:${b.filters.where((r) => r.isNotEmpty).length}',
    ]);
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(_Discover old) {
    super.didUpdateWidget(old);
    if (old.source != widget.source) {
      _page = _tab = '';
      _last = null;
      _load();
      return;
    }
    // A new default page arrived in the background (the stored one is shown first at launch): swap it in
    final cur = _cur;
    final fresh = context.appRead.peekData(_req);
    if (cur != null && fresh != null && !identical(fresh, cur)) _got(fresh);
  }

  void _open(String page, {bool filter = false, String? tab}) {
    if (page == _page) return;
    setState(() {
      _page = page;
      _fromFilter = filter;
      if (tab != null) {
        _tab = tab;
        _expanded = false;
        _more = false;
      }
      _load();
    });
  }

  Widget _bars(bool loading) {
    final b = _cur ?? _last;
    // Loading and the labels changed: draw outlines for as many label rows as this tab had last time
    final bones = loading && (b == null || !_fromFilter)
        ? int.tryParse(
                _layoutOf(
                      _barsKey,
                      _familyKey == null ? null : '$_familyKey#bars',
                    )
                    .firstWhere(
                      (x) => x.startsWith('chips:'),
                      orElse: () => 'chips:0',
                    )
                    .substring(6),
              ) ??
              0
        : 0;
    if (b == null) return CategoryBones(chips: bones);
    if (b.tabs.isEmpty && b.filters.isEmpty) return const SizedBox();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _DiscoverBars(
          tabs: b.tabs,
          filters: loading && !_fromFilter ? const [] : b.filters,
          page: loading ? _page : null,
          tab: _tab,
          expanded: _expanded,
          onExpand: (v) => setState(() => _expanded = v),
          more: _more,
          onMore: (v) => setState(() => _more = v),
          onTab: (p) => _open(p, tab: p),
          onFilter: (p) => _open(p, filter: true),
        ),
        if (bones > 0) CategoryBones(cards: false, chips: bones),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    // Cache is gone (account switched, plugin settings changed): fetch again
    if (_cur != null && app.peekData(_req) == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(_load);
      });
    }
    final cur = _cur, err = _error;
    final loading = cur == null && err == null;
    final Widget body;
    if (err != null) {
      body = Notice(
        errorText(err),
        action: context.l10n.actionRetry,
        onAction: () => setState(_load),
      );
    } else if (cur == null) {
      body = SkeletonSections(_layoutOf(_layoutKey, _familyKey));
    } else {
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: browseSections(
          context,
          widget.source,
          _layoutKey,
          cur,
          family: _familyKey,
        ),
      );
    }
    return _Scroll(
      children: [
        ...widget.head,
        _bars(loading),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 260),
          switchInCurve: Curves.easeOut,
          layoutBuilder: (cur, prev) =>
              Stack(alignment: Alignment.topLeft, children: [...prev, ?cur]),
          child: KeyedSubtree(
            key: ValueKey(cur != null ? _cacheKey : (err != null ? 2 : 0)),
            child: body,
          ),
        ),
      ],
    );
  }
}

/// The category widget below the title (final "分类 · 组卡（两层）"): top group cards are tabs,
/// the pills below are sub-tabs (possibly several rows, e.g. region, genre, initial for artists).
class _DiscoverBars extends StatefulWidget {
  const _DiscoverBars({
    required this.tabs,
    required this.filters,
    required this.page,
    required this.tab,
    required this.expanded,
    required this.onExpand,
    required this.more,
    required this.onMore,
    required this.onTab,
    required this.onFilter,
  });
  final bool expanded;
  final ValueChanged<bool> onExpand;

  /// The "More categories" panel is open; also counts as open when the selected category is inside the panel.
  final bool more;
  final ValueChanged<bool> onMore;
  final List<m.Choice> tabs;
  final List<List<m.Choice>> filters;

  /// The page just tapped while loading: draw it as selected first.
  final String? page;
  final String tab;
  final ValueChanged<String> onTab, onFilter;

  @override
  State<_DiscoverBars> createState() => _DiscoverBarsState();
}

class _DiscoverBarsState extends State<_DiscoverBars> {
  bool _isOn(m.Choice c) =>
      widget.page != null ? c.page == widget.page : c.selected;

  Widget _cards() {
    final tabs = widget.tabs;
    var on = widget.page != null
        ? tabs.indexWhere((t) => t.page == widget.page)
        : tabs.indexWhere((t) => t.selected);
    // Tapped a pill (not a group card) while loading: the group card stays as it was
    if (on < 0) on = tabs.indexWhere((t) => t.page == widget.tab);
    return CategoryCards(
      items: tabs,
      selected: on,
      onTap: (i) => widget.onTab(tabs[i].page),
      expanded: widget.expanded,
      onExpand: widget.onExpand,
    );
  }

  Widget _chip(m.Choice c, bool open) {
    if (c.groups.isEmpty) {
      return CategoryChip(
        c.title,
        selected: _isOn(c),
        onTap: () => widget.onFilter(c.page),
      );
    }
    return CategoryChip(c.title, open: open, onTap: () => widget.onMore(!open));
  }

  @override
  Widget build(BuildContext context) {
    // Labels with groups ("More categories"): expand the panel when it's open or the selected category is in it
    m.Choice? grouped;
    for (final row in widget.filters) {
      for (final c in row) {
        if (c.groups.isNotEmpty) grouped = c;
      }
    }
    final inside =
        grouped != null && grouped.groups.any((g) => g.options.any(_isOn));
    final open = grouped != null && (widget.more || inside);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.tabs.isNotEmpty) ...[const SizedBox(height: 32), _cards()],
        for (final (i, row) in widget.filters.indexed)
          if (row.isNotEmpty) ...[
            SizedBox(height: i == 0 ? 16 : 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [for (final c in row) _chip(c, open)],
            ),
          ],
        if (open) ...[
          const SizedBox(height: 16),
          CategoryPanel(
            groups: grouped.groups,
            isOn: _isOn,
            onTap: (o) => widget.onFilter(o.page),
          ),
        ],
      ],
    );
  }
}

// ───── Search ─────

String _lastQuery = '';

class RemoteSearchPage extends StatefulWidget {
  const RemoteSearchPage({super.key, required this.source});
  final String source;

  @override
  State<RemoteSearchPage> createState() => _RemoteSearchPageState();
}

class _RemoteSearchPageState extends State<RemoteSearchPage> {
  late final _ctl = TextEditingController(text: _lastQuery);
  final _focus = FocusNode();
  Timer? _debounce;

  /// The term whose results are shown; search history when empty.
  late String _shown = _lastQuery.trim();

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() {}));
    _ctl.addListener(_valueChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _ctl.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _search() {
    _debounce?.cancel();
    _lastQuery = _ctl.text;
    final q = _ctl.text.trim();
    if (q == _shown) return;
    setState(() => _shown = q);
  }

  // Search 450ms after typing stops; don't search while the IME is still composing (uncommitted pinyin).
  // Watch the whole input state rather than onChanged: when a candidate is committed the text doesn't change, only composing ends,
  // so onChanged doesn't fire.
  late String _typed = _ctl.text;

  void _valueChanged() {
    final v = _ctl.value;
    if (v.composing.isValid) return _debounce?.cancel();
    if (v.text == _typed) return;
    _typed = v.text;
    _debounce?.cancel();
    // Cleared: go back to search history right away
    if (v.text.trim().isEmpty) return _search();
    _debounce = Timer(const Duration(milliseconds: 450), _search);
  }

  void _word(String w) {
    _ctl.text = w;
    _ctl.selection = TextSelection.collapsed(offset: w.length);
    context.appRead.rememberQuery(w);
    _search();
    _focus.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final s = _src(context, widget.source);
    return Padding(
      padding: const EdgeInsets.fromLTRB(40, 20, 40, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search is a top-level sidebar page, so no back button; keep the original height so the search field doesn't jump
          const SizedBox(height: 64),
          SearchFieldBar(
            controller: _ctl,
            focusNode: _focus,
            autofocus: true,
            placeholder: context.l10n.searchPlaceholder,
            onSubmitted: (_) {
              app.rememberQuery(_ctl.text);
              _search();
              _focus.requestFocus();
            },
            onClear: () {
              _ctl.clear();
              _search();
              _focus.requestFocus();
            },
          ),
          Expanded(
            child: s == null
                ? _missing(widget.source)
                : !s.can(Op.search)
                ? Notice(context.l10n.searchUnsupported)
                : _shown.isEmpty
                ? SearchIdle(source: widget.source, onWord: _word)
                : SearchResults(
                    key: ValueKey('${widget.source}|$_shown'),
                    source: widget.source,
                    query: _shown,
                    onHit: (h) {
                      app.rememberQuery(_shown);
                      app.rememberHit(h);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// ───── Album, artist, playlist ─────

class RemoteAlbumPage extends StatelessWidget {
  const RemoteAlbumPage({super.key, required this.source, required this.id});
  final String source, id;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final s = _src(context, source);
    if (s == null) {
      return _Scroll(
        children: [
          BackBtn(onTap: app.back),
          _missing(source),
        ],
      );
    }
    return Loaded<m.AlbumPage>(
      req: DataReq.album(source, id),
      // Remember the converted UI Album; AlbumPage looks it up by id
      onData: (p) => app.putAlbum(source, p),
      placeholder: const AlbumSkeleton(),
      builder: (_, p) => AlbumPage(id: '@$source/${p.album.id}'),
    );
  }
}

class RemoteArtistPage extends StatelessWidget {
  const RemoteArtistPage({super.key, required this.source, required this.id});
  final String source, id;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final s = _src(context, source);
    if (s == null) {
      return _Scroll(
        children: [
          BackBtn(onTap: app.back),
          _missing(source),
        ],
      );
    }
    // The same artist page as the design (final · artist page)
    return Loaded<m.ArtistPage>(
      req: DataReq.artist(source, id),
      onData: (p) => app.checkLiked(_tracks(p.tracks, source)),
      placeholder: const ArtistSkeleton(),
      builder: (context, page) => ArtistPage(
        key: ValueKey('$source/artist/$id'),
        data: _artistData(context.l10n, s, page),
      ),
    );
  }
}

String _discKind(AppLocalizations l, String kind) => switch (kind) {
  'album' => l.albumKindAlbum,
  'single' => l.albumKindSingle,
  'ep' => 'EP',
  'compilation' => l.albumKindCompilation,
  _ => l.albumKindAlbum,
};

String _localDate(AppLocalizations l, String iso) {
  final p = iso.split('-').map(int.tryParse).toList();
  if (p.isEmpty || p[0] == null) return '';
  if (p.length < 3 || p[1] == null || p[2] == null) return l.dateYear(p[0]!);
  return l.dateYearMonthDay(p[0]!, p[1]!, p[2]!);
}

ArtistData _artistData(AppLocalizations l, Source s, m.ArtistPage page) {
  final a = page.artist;
  final src = s.id;
  Future<void> playAlbum(AppState app, m.Album al) async {
    try {
      final p = await s.album(al.id);
      app.playList(_tracks(p.tracks, src), name: al.name);
    } catch (_) {
      showToast(L.remotePlayAlbumFailed);
    }
  }

  ArtistDisc disc(m.Album al) => ArtistDisc(
    title: al.name,
    cover: al.imageUrl,
    year: al.year == null ? '' : '${al.year}',
    route: AppState.remoteRoute('album', src, al.id),
    kind: _discKind(l, al.kind),
    date: _localDate(l, al.released),
    meta: al.trackCount > 0 ? l.countTracks(al.trackCount) : '',
    play: (app) => playAlbum(app, al),
  );

  // By release date, newest first
  final albums = [...page.albums]
    ..sort((x, y) => y.released.compareTo(x.released));
  final full = [
    for (final al in albums)
      if (al.kind != 'single' && al.kind != 'ep') disc(al),
  ];
  final singles = [
    for (final al in albums)
      if (al.kind == 'single' || al.kind == 'ep') disc(al),
  ];
  return ArtistData(
    name: a.name,
    avatar: a.imageUrl,
    following: a.following,
    follow: s.can(Op.followArtist) ? (on) => s.followArtist(a.id, on) : null,
    hot: _tracks(page.tracks, src),
    latest: albums.isEmpty ? null : disc(albums.first),
    tabs: [(l.tabAlbums, full), (l.artistSinglesAndEps, singles)],
    similar: [
      for (final r in page.related)
        (
          name: r.name,
          cover: r.imageUrl,
          route: AppState.remoteRoute('artist', src, r.id),
        ),
    ],
  );
}

class RemotePlaylistPage extends StatelessWidget {
  const RemotePlaylistPage({super.key, required this.source, required this.id});
  final String source, id;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final s = _src(context, source);
    if (s == null) {
      return _Scroll(
        children: [
          BackBtn(onTap: app.back),
          _missing(source),
        ],
      );
    }
    // The same page as local playlists (final · playlist page)
    return Loaded<m.Playlist>(
      req: DataReq.playlist(source, id),
      onData: (p) => app.checkLiked(_tracks(p.tracks, source)),
      placeholder: const PlaylistSkeleton(),
      builder: (_, p) => PlaylistPage(
        key: ValueKey('$source/playlist/$id'),
        data: PlaylistData(
          name: p.name,
          owner: p.owner,
          description: p.description,
          cover: p.imageUrl,
          count: p.trackCount,
          from: 'playlist:$source/$id',
          editable: p.mine && !p.fixed ? id : '',
          saved: p.saved,
          onToggleSave: s.can(Op.savePlaylist) && !p.mine && !p.fixed
              ? (save) => app.toggleSavePlaylist(s, p, save)
              : null,
          rows: [
            for (final t in _tracks(p.tracks, source))
              (track: t, added: addedText(t.added)),
          ],
        ),
      ),
    );
  }
}
