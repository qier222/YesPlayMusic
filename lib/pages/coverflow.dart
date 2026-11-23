import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../cache/requests.dart';
import '../cover_color.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../music/source.dart';
import '../shell.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'remote.dart' show errorText;

const _designH = 900.0;
const _designSize = 487.2;
const _designCoverTop = 172.0; // front cover y = 172 in the design
const _designCenterY = _designCoverTop + _designSize / 2;

// Mimics iPod Coverflow: all covers share one viewpoint (stage center); side covers aren't scaled down
// but rotated 75° and pushed back, with the inner edge far and the outer edge near; the first one's inner edge touches the front cover.
// The 3D lengths below are baseline values for the 900-high design, scaled proportionally to the window height at runtime.
const _angle = 75.0;
// Distance from viewpoint to stage (perspective strength)
const _camera = 2000.0;
// Distance from center to the first side cover's center (3D space)
const _gap1 = 420.0;
const _depth = 745.0; // how far side covers are pushed back
const _step = 165.0; // spacing between side covers (3D space)
// Roughly how many screen pixels per cover: drag and visible range are based on it
const _pace = 120.0;

/// Coverflow stage layout and 3D geometry scaled to the window size.
class _StageMetrics {
  const _StageMetrics._({
    required this.scale,
    required this.size,
    required this.coverTop,
    required this.stripPadTop,
    required this.stripHeight,
    required this.camera,
    required this.gap1,
    required this.depth,
    required this.step,
    required this.pace,
  });

  factory _StageMetrics.from(double w, double h) {
    // Based on the 900-high design, scaled to window height; very narrow windows are also width-constrained so covers don't fill the screen.
    final s = math.min(h / _designH, w / 780.0).clamp(0.45, 2.5);
    final size = _designSize * s;
    final coverTop = math.max(84.0, h * (_designCenterY / _designH) - size / 2);
    return _StageMetrics._(
      scale: s,
      size: size,
      coverTop: coverTop,
      stripPadTop: 32.0 * s,
      stripHeight: 560.0 * s,
      camera: _camera * s,
      gap1: _gap1 * s,
      depth: _depth * s,
      step: _step * s,
      pace: _pace * s,
    );
  }

  final double scale;
  final double size;
  final double coverTop;
  final double stripPadTop;
  final double stripHeight;
  final double camera;
  final double gap1;
  final double depth;
  final double step;
  final double pace;

  double get stripTop => coverTop - stripPadTop;
  double get coverBottom => coverTop + size;
  double get fadeTop => coverTop + 412.8 * scale;
  double get fadeHeight => 111.36 * scale;
  double get blackTop => fadeTop + fadeHeight - 1.0;
  double get titleTop => coverBottom + 9.8 * scale;
}

/// Four tabs, matching the library routes and part names of SourceLibrary one-to-one.
const _tabs = ['songs', 'albums', 'playlists', 'artists'];
const _parts = ['tracks', 'albums', 'playlists', 'artists'];
List<String> _labels(AppLocalizations l) => [
  l.tabSongs,
  l.tabAlbums,
  l.tabPlaylists,
  l.tabArtists,
];
List<String> _empty(AppLocalizations l) => [
  l.libraryNoSongs,
  l.libraryNoAlbums,
  l.libraryNoPlaylists,
  l.libraryNoArtists,
];

/// A cover in Coverflow.
class _Item {
  const _Item({
    required this.title,
    required this.sub,
    required this.cover,
    this.play,
    this.route = '',
    this.trackKey,
    this.from,
    this.round = false,
    this.artistId = '',
    this.hasAvatar = false,
  });
  final String title, sub, cover;

  /// The page it opens; can't be opened when empty.
  final String route;

  /// Plays it.
  final VoidCallback? play;

  /// Song key, used to tell whether the front one is playing.
  final String? trackKey;

  /// [AppState.queueFrom] once the album, playlist or artist is played, used to tell whether it's playing.
  final String? from;

  /// Artist covers are shown round.
  final bool round;

  /// The artist's id in the current source; the avatar is fetched on demand if not yet available.
  final String artistId;

  /// [cover] is already the artist avatar.
  final bool hasAvatar;

  bool playingIn(AppState app) =>
      (trackKey != null && app.track.key == trackKey) ||
      (from != null && app.queueFrom == from);
}

String _count(int n) =>
    n < 1000 ? '$n' : '${n ~/ 1000},${(n % 1000).toString().padLeft(3, '0')}';

class CoverflowPage extends StatefulWidget {
  const CoverflowPage({super.key, this.tab = 'albums'});

  /// Tab selected on open: songs, albums, playlists, artists.
  final String tab;

  @override
  State<CoverflowPage> createState() => _CoverflowPageState();
}

class _CoverflowPageState extends State<CoverflowPage>
    with SingleTickerProviderStateMixin {
  int _target = 0;
  late int _tab = math.max(0, _tabs.indexOf(widget.tab));
  bool _frontHover = false;
  // Direction of the last move: 1 flips right (new cover comes from the right), -1 left, 0 tab change
  int _dir = 0;
  // The current tab has been positioned at its starting cover
  bool _placed = false;
  // Last playing track seen on the songs tab; scrolls to it when the song changes
  String? _lastTrackKey;
  double? _drag; // continuous position while dragging
  late final AnimationController _anim = AnimationController.unbounded(
    vsync: this,
  );
  final _focus = FocusNode();

  List<_Item> _items = const [];
  // Which list _items was built from; not rebuilt if unchanged
  Object? _itemsSrc = const Object();
  int _itemsTab = -1;
  Locale? _itemsLocale;
  final Map<String, String> _artistAvatars = {}; // '$source/$id' -> avatar url
  final Set<String> _artistAvatarLoading = {};

  /// The image to show for this cover: artists prefer the real avatar (cached or fetched on demand).
  String _coverOf(AppState app, _Item it, {bool fetch = false}) {
    if (!it.round || it.hasAvatar || it.artistId.isEmpty) return it.cover;
    final source = app.sourceId;
    final key = '$source/${it.artistId}';
    final cached = _artistAvatars[key];
    if (cached != null) return cached.isNotEmpty ? cached : it.cover;
    final s = app.sources[source];
    if (s == null || !s.can(Op.artist)) return it.cover;
    final req = DataReq.artist(source, it.artistId);
    final peeked = app.peekData(req);
    if (peeked != null) {
      final url = peeked.artist.imageUrl;
      _artistAvatars[key] = url;
      return url.isNotEmpty ? url : it.cover;
    }
    if (fetch && _artistAvatarLoading.add(key)) {
      scheduleMicrotask(() async {
        try {
          final page = await app.getData(req);
          if (!mounted) return;
          final url = page.artist.imageUrl;
          setState(() => _artistAvatars[key] = url);
        } catch (_) {
          _artistAvatars[key] = '';
        } finally {
          _artistAvatarLoading.remove(key);
        }
      });
    }
    return it.cover;
  }

  /// Covers for the current tab: the current source's library; empty when there's no library.
  List<_Item> _itemsFor(AppState app, AppLocalizations l, Locale locale) {
    final lib = app.library;
    final Object? src = lib == null
        ? null
        : [lib.tracks, lib.albums, lib.playlists, lib.artists][_tab];
    if (_itemsTab == _tab &&
        identical(src, _itemsSrc) &&
        _itemsLocale == locale) {
      return _items;
    }
    _itemsTab = _tab;
    _itemsSrc = src;
    _itemsLocale = locale;
    if (lib == null) return _items = const [];
    final source = app.sourceId;
    return _items = switch (_tab) {
      0 => [
        for (final (i, t) in lib.tracks.indexed)
          _Item(
            title: t.title,
            sub: t.artist,
            cover: t.cover,
            trackKey: t.key,
            play: () => app.playList(lib.tracks, start: i, from: 'library'),
          ),
      ],
      1 => [
        for (final a in lib.albums)
          _Item(
            title: a.title,
            sub: a.artist,
            cover: a.cover,
            route: AppState.albumRoute(a.id),
            play: () => app.playAlbumById(a.id),
            from: 'album:${a.id}',
          ),
      ],
      2 => [
        for (final p in lib.playlists)
          _Item(
            title: p.name,
            sub: p.owner.isNotEmpty
                ? p.owner
                : (p.trackCount > 0 ? l.countTracks(p.trackCount) : ''),
            cover: p.imageUrl,
            route: AppState.remoteRoute('playlist', source, p.id),
            play: () => app.playPlaylist(source, p.id),
            from: 'playlist:$source/${p.id}',
          ),
      ],
      _ => [
        for (final a in lib.artists)
          _Item(
            title: a.name,
            sub: a.weight <= 0
                ? ''
                : lib.tracks.isEmpty
                ? l.countAlbums(a.weight)
                : l.countSongs(a.weight),
            cover: a.cover,
            route: a.route,
            play: () => app.playArtistShuffle(source, id: a.id, name: a.name),
            from:
                'artist:$source/${a.id.isNotEmpty ? a.id : a.name.toLowerCase()}',
            round: true,
            artistId: a.id,
            hasAvatar: a.hasAvatar,
          ),
      ],
    };
  }

  /// Where to stop on open or tab change: the playing song (songs) / album.
  int _start(AppState app, List<_Item> items) {
    final t = app.track;
    var i = items.indexWhere((it) => it.playingIn(app));
    if (i < 0 && _tab == 1) {
      i = items.indexWhere(
        (it) => it.title == t.album && it.sub.startsWith(t.artist),
      );
    }
    return math.max(0, i);
  }

  void _selectTab(int i) {
    if (i == _tab) return;
    setState(() {
      _tab = i;
      _dir = 0;
      _placed = false;
      _frontHover = false;
      _drag = null;
    });
  }

  void _open(_Item it) {
    if (it.route.isNotEmpty) context.appRead.go(it.route);
  }

  void _goTo(int i) {
    final n = _items.length;
    if (n == 0) return;
    final next = i.clamp(0, n - 1);
    if (next != _target) _dir = (next - _target).sign;
    _target = next;
    _drag = null;
    _anim.animateTo(
      _target.toDouble(),
      duration: const Duration(milliseconds: 520),
      curve: const SpringCurve(bounce: 0.06),
    );
    setState(() {});
  }

  @override
  void dispose() {
    _anim.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final lib = app.library;
    final items = _itemsFor(app, l, Localizations.localeOf(context));
    final n = items.length;
    final trackKey = app.hasQueue ? app.track.key : null;
    if (n == 0) {
      _placed = false;
      _lastTrackKey = trackKey;
    } else if (!_placed) {
      // First content (or tab changed): jump straight to the starting cover without animation
      _placed = true;
      _lastTrackKey = trackKey;
      _anim.stop();
      _target = _start(app, items);
      _anim.value = _target.toDouble();
    } else {
      if (_target >= n) {
        // The library shrank after reloading
        _target = n - 1;
        _anim.value = _target.toDouble();
      }
      if (_tab == 0 && trackKey != _lastTrackKey) {
        _lastTrackKey = trackKey;
        if (trackKey != null && _drag == null) {
          final i = items.indexWhere((it) => it.trackKey == trackKey);
          if (i >= 0 && i != _target) {
            _dir = (i - _target).sign;
            _target = i;
            _anim.animateTo(
              _target.toDouble(),
              duration: const Duration(milliseconds: 520),
              curve: const SpringCurve(bounce: 0.06),
            );
          }
        }
      }
    }
    final cur = n == 0 ? null : items[_target];
    final titleKey = ValueKey('$_tab/$_target');
    String count(int i) {
      if (lib == null) return '0';
      final c = [
        lib.tracks.length,
        lib.albums.length,
        lib.playlists.length,
        lib.artists.length,
      ][i];
      return c == 0 && lib.loading.contains(_parts[i]) ? '…' : _count(c);
    }

    return Focus(
      focusNode: _focus,
      autofocus: true,
      onKeyEvent: (_, e) {
        if (e is! KeyDownEvent && e is! KeyRepeatEvent) {
          return KeyEventResult.ignored;
        }
        if (e.logicalKey == LogicalKeyboardKey.arrowLeft) {
          _goTo(_target - 1);
        } else if (e.logicalKey == LogicalKeyboardKey.arrowRight) {
          _goTo(_target + 1);
        } else if (e.logicalKey == LogicalKeyboardKey.escape) {
          app.back();
        } else if (e.logicalKey == LogicalKeyboardKey.space) {
          app.togglePlay();
        } else if (e.logicalKey == LogicalKeyboardKey.enter && cur != null) {
          _open(cur);
        } else {
          return KeyEventResult.ignored;
        }
        return KeyEventResult.handled;
      },
      child: Container(
        color: black,
        child: LayoutBuilder(
          builder: (context, box) {
            final w = box.maxWidth;
            final metrics = _StageMetrics.from(w, box.maxHeight);
            return Stack(
              clipBehavior: Clip.hardEdge,
              children: [
                // Top half background: the current cover's dominant color fading down to black; color transitions smoothly when the cover changes
                Positioned.fill(
                  child: IgnorePointer(
                    child: CoverTone(
                      coverId: cur == null
                          ? ''
                          : _coverOf(app, cur, fetch: true),
                      builder: (_, p) => DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            // Empty state has no cover: neutral dark gray fading to black (final · Coverflow empty)
                            colors: cur == null
                                ? const [Color(0xFF1C1C20), black, black]
                                : [
                                    p.deep,
                                    Color.lerp(p.deep, black, 0.45)!,
                                    black,
                                    black,
                                  ],
                            stops: cur == null
                                ? const [0, 0.7, 1]
                                : const [0, 0.38, 0.62, 1],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                // Cover strip (scaled proportionally to window height)
                Positioned(
                  left: 0,
                  right: 0,
                  top: metrics.stripTop,
                  height: metrics.stripHeight,
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onHorizontalDragStart: (_) {
                      if (n == 0) return;
                      _anim.stop();
                      _drag = _anim.value;
                    },
                    onHorizontalDragUpdate: (d) {
                      if (n == 0 || _drag == null) return;
                      _drag = (_drag! - d.delta.dx / metrics.pace).clamp(
                        -0.4,
                        n - 1 + 0.4,
                      );
                      _anim.value = _drag!;
                    },
                    onHorizontalDragEnd: (d) {
                      if (n == 0 || _drag == null) return;
                      final v =
                          _drag! -
                          d.velocity.pixelsPerSecond.dx / metrics.pace * 0.15;
                      _goTo(v.round());
                    },
                    child: MouseRegion(
                      cursor: SystemMouseCursors.click,
                      child: Listener(
                        onPointerSignal: (e) {
                          if (e is PointerScrollEvent) {
                            final d =
                                e.scrollDelta.dx.abs() > e.scrollDelta.dy.abs()
                                ? e.scrollDelta.dx
                                : e.scrollDelta.dy;
                            if (d.abs() > 4) _goTo(_target + d.sign.toInt());
                          }
                        },
                        child: AnimatedBuilder(
                          animation: _anim,
                          builder: (context, _) {
                            final idx = _anim.value;
                            // The library may have thousands of songs; only lay out the part visible on screen
                            final reach = (w / 2 / metrics.pace).ceil() + 2;
                            final lo = math.max(0, idx.floor() - reach);
                            final hi = math.min(n - 1, idx.ceil() + reach);
                            final order = [for (var i = lo; i <= hi; i++) i]
                              ..sort(
                                (a, b) =>
                                    (b - idx).abs().compareTo((a - idx).abs()),
                              );
                            return Stack(
                              clipBehavior: Clip.none,
                              children: [
                                for (final i in order)
                                  ?_cover(items, i, i - idx, w, metrics, app),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
                // Fade out the bottom edge of the reflection
                Positioned(
                  left: 0,
                  right: 0,
                  top: metrics.fadeTop,
                  height: metrics.fadeHeight,
                  child: IgnorePointer(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [ba(0), black],
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  top: metrics.blackTop,
                  bottom: 0,
                  child: IgnorePointer(child: Container(color: black)),
                ),
                // The current tab has no content yet: loading, error or empty (final · Coverflow empty v30)
                if (n == 0 && !app.scanning)
                  Positioned.fill(
                    left: 40,
                    right: 40,
                    child: Align(
                      alignment: const Alignment(0, -0.04),
                      child: _emptyMessage(app),
                    ),
                  ),
                // Title bar drag area at the top (beneath the top buttons)
                const Positioned(
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 80,
                  child: DragWindow(),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  top: 28,
                  child: Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        for (final (i, label) in _labels(l).indexed) ...[
                          if (i > 0) const SizedBox(width: 8),
                          CoverPill(
                            label: label,
                            count: count(i),
                            active: _tab == i,
                            onTap: () => _selectTab(i),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                // Title and artist below the cover
                if (cur != null)
                  Positioned(
                    left: 0,
                    right: 0,
                    top: metrics.titleTop,
                    child: IgnorePointer(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 320),
                        switchInCurve: Curves.easeOutCubic,
                        switchOutCurve: Curves.easeInCubic,
                        // Slide along with the cover motion: the new title enters from the side being flipped in,
                        // the old title exits the other side
                        transitionBuilder: (c, a) {
                          final incoming = c.key == titleKey;
                          final dx = 72.0 * (incoming ? _dir : -_dir);
                          return AnimatedBuilder(
                            animation: a,
                            child: c,
                            builder: (_, child) => Opacity(
                              opacity: a.value.clamp(0.0, 1.0),
                              child: Transform.translate(
                                offset: Offset((1 - a.value) * dx, 0),
                                child: child,
                              ),
                            ),
                          );
                        },
                        layoutBuilder: (c, p) => Stack(
                          alignment: Alignment.topCenter,
                          children: [...p, ?c],
                        ),
                        child: Column(
                          key: titleKey,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 80,
                              ),
                              child: tx(
                                cur.title,
                                30,
                                w: w900,
                                f: F.wide,
                                c: white,
                                align: TextAlign.center,
                              ),
                            ),
                            const SizedBox(height: 10),
                            tx(cur.sub, 15, w: w600, c: wa(0.6)),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _emptyMessage(AppState app) {
    final l = context.l10n;
    final lib = app.library;
    final err = lib?.errors[_parts[_tab]];
    if (err != null) {
      return EmptyMessage(
        title: l.stateLoadFailed,
        sub: errorText(err),
        onDark: true,
        actions: [
          Btn(label: l.actionRetry, onCover: true, onTap: app.reloadLibrary),
        ],
      );
    }
    if (lib?.loading.contains(_parts[_tab]) ?? false) {
      return tx(l.stateLoading, 15, w: w600, c: wa(0.6));
    }
    return EmptyMessage(title: _empty(l)[_tab], onDark: true);
  }

  /// A cover image; dark gray with an icon when there's no cover or it fails to load.
  Widget _art(String cover, double size, double dpr, {bool round = false}) {
    final blank = ColoredBox(
      color: const Color(0xFF1C1C1E),
      child: Center(
        child: Ico(
          round ? 'user' : 'music',
          size: size * (96 / _designSize),
          color: wa(0.18),
        ),
      ),
    );
    if (cover.isEmpty) return blank;
    // Decode width rounds up to multiples of 128px so resizing the window doesn't re-decode every pixel.
    final cacheW = (((size * dpr) / 128).ceil() * 128).clamp(128, 4096);
    return Image(
      // Local / network covers can be large; decode at display size, and the reflection shares the cache
      image: ResizeImage.resizeIfNeeded(cacheW, null, coverImage(cover)),
      width: size,
      height: size,
      fit: BoxFit.cover,
      filterQuality: FilterQuality.medium,
      gaplessPlayback: true,
      errorBuilder: (_, _, _) => blank,
    );
  }

  Widget? _cover(
    List<_Item> items,
    int i,
    double d,
    double stageW,
    _StageMetrics metrics,
    AppState app,
  ) {
    final it = items[i];
    final cover = _coverOf(app, it, fetch: true);
    final size = metrics.size;
    final dpr = MediaQuery.maybeDevicePixelRatioOf(context) ?? 2;
    // Main action on the front cover: toggle play / pause for the playing one; otherwise play it,
    // or open it if it can't be played.
    final current = it.playingIn(app);
    final VoidCallback? action = current
        ? context.appRead.togglePlay
        : it.play ?? (it.route.isEmpty ? null : () => _open(it));
    final icon = current && app.playing
        ? 'pause'
        : (current || it.play != null ? 'play' : 'arrow-right');
    final l = context.l10n;
    final tip = switch (icon) {
      'pause' => l.actionPause,
      'play' => l.actionPlay,
      _ => l.actionOpen,
    };
    final ad = d.abs();
    final isFront = ad < 0.5;
    final k = math.min(ad, 1.0);
    final sign = d < 0 ? -1.0 : 1.0;
    var off = k * metrics.gap1;
    if (ad > 1) off += (ad - 1) * metrics.step;
    final z = k * metrics.depth;
    final a = _angle * k * math.pi / 180;
    // Where the inner edge (toward the center) projects on screen; skip drawing if it's off stage
    final inX = off - size / 2 * math.cos(a);
    final inZ = z + size / 2 * math.sin(a);
    if (inX * metrics.camera / (metrics.camera + inZ) > stageW / 2) return null;
    // Flutter's rotateY goes the opposite way from design tools: positive angles move the left edge inward
    final rot = sign * a;
    final shade = math.min(0.08 * ad, 0.48);
    final refl = math.max(0.24 - 0.02 * ad, 0.12);
    final btnSize = (80.0 * metrics.scale).clamp(64.0, 108.0);
    final btnIconSize = (36.0 * metrics.scale).clamp(28.0, 48.0);

    // Perspective × translate × rotate: each one is placed at stage center and then moved, so the viewpoint is shared
    final m = Matrix4.identity()
      ..setEntry(3, 2, 1 / metrics.camera)
      ..translateByDouble(sign * off, 0, z, 1)
      ..rotateY(rot);

    Widget artContent = Stack(
      fit: StackFit.expand,
      children: [
        _art(cover, size, dpr, round: it.round),
        if (shade > 0.005) ColoredBox(color: ba(shade)),
        // Hovering the front cover shows a play / pause overlay (Sketch: 25% black scrim + 80 white circle + 36 icon)
        if (isFront && action != null)
          IgnorePointer(
            ignoring: !_frontHover,
            child: AnimatedOpacity(
              duration: fast,
              opacity: _frontHover ? 1 : 0,
              child: Container(
                color: ba(0.25),
                alignment: Alignment.center,
                child: AnimatedScale(
                  duration: const Duration(milliseconds: 220),
                  scale: _frontHover ? 1 : 0.88,
                  curve: bouncy,
                  child: Tap(
                    tip: tip,
                    tipOnCover: true,
                    onTap: action,
                    builder: (_, hh, p) => PressScale(
                      pressed: p,
                      hover: hh,
                      up: 1.06,
                      child: Container(
                        width: btnSize,
                        height: btnSize,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(
                          color: white,
                          shape: BoxShape.circle,
                        ),
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 180),
                          transitionBuilder: (c, a) =>
                              ScaleTransition(scale: a, child: c),
                          child: Ico(
                            icon,
                            key: ValueKey(icon),
                            size: btnIconSize,
                            color: darkInk,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
    if (it.round) artContent = ClipOval(child: artContent);

    Widget art = SizedBox(width: size, height: size, child: artContent);

    if (isFront) {
      art = MouseRegion(
        onEnter: (_) => setState(() => _frontHover = true),
        onExit: (_) => setState(() => _frontHover = false),
        child: art,
      );
    }

    Widget reflArt = SizedBox(
      width: size,
      height: size,
      child: _art(cover, size, dpr, round: it.round),
    );
    if (it.round) reflArt = ClipOval(child: reflArt);

    return Positioned(
      key: ValueKey(i),
      left: stageW / 2 - size / 2,
      top: metrics.stripPadTop,
      width: size,
      child: Transform(
        // Origin = cover center (with a 0.42-high reflection below); side covers are vertically centered
        alignment: const Alignment(0, 0.5 / 1.42 * 2 - 1),
        transform: m,
        child: GestureDetector(
          onTap: isFront ? null : () => _goTo(i),
          onDoubleTap: isFront ? action : null,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              art,
              // Reflection
              Opacity(
                opacity: refl,
                child: SizedBox(
                  width: size,
                  height: size * 0.42,
                  child: ShaderMask(
                    blendMode: BlendMode.dstIn,
                    shaderCallback: (r) => LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [black, ba(0)],
                    ).createShader(r),
                    child: ClipRect(
                      child: OverflowBox(
                        alignment: Alignment.topCenter,
                        maxHeight: size,
                        minHeight: size,
                        child: Transform.flip(flipY: true, child: reflArt),
                      ),
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
}
