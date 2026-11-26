import 'dart:math' as math;

import 'package:file_selector/file_selector.dart';
import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../cover_color.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'settings.dart' show openPluginSettings;
import 'remote.dart' show Notice, errorText;
import 'links.dart';

/// Height of the library header (tab row); page content starts below it.
const _headerH = 122.0;

class LibraryPage extends StatelessWidget {
  const LibraryPage({super.key, required this.tab});
  final String tab;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    Widget body;
    Widget? right;
    if (app.library == null) {
      // No local music found and no plugin chosen: the whole library is empty (final · empty state v30)
      body = const _LibraryEmpty();
    } else {
      switch (tab) {
        case 'songs':
          body = const _SongsBody();
        case 'playlists':
          body = const _PlaylistsBody();
          right = _PlaylistTabs();
        case 'artists':
          body = const _ArtistsBody();
        default:
          body = const _AlbumsBody();
          right = TextTabs(
            labels: [context.l10n.sortTitleAZ, context.l10n.sortReleaseDate],
            selected: app.shelfSort,
            onChanged: (i) => app.update(() => app.shelfSort = i),
          );
      }
    }
    return Stack(
      children: [
        Positioned.fill(
          top: _headerH,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 280),
            switchInCurve: Curves.easeOutCubic,
            transitionBuilder: (c, a) => FadeTransition(
              opacity: a,
              child: SlideTransition(
                position: Tween(
                  begin: const Offset(0, 0.015),
                  end: Offset.zero,
                ).animate(a),
                child: c,
              ),
            ),
            layoutBuilder: (cur, prev) =>
                Stack(fit: StackFit.expand, children: [...prev, ?cur]),
            child: KeyedSubtree(key: ValueKey(tab), child: body),
          ),
        ),
        _LibraryHeader(active: tab, right: right),
      ],
    );
  }
}

class _LibraryHeader extends StatelessWidget {
  const _LibraryHeader({required this.active, this.right});
  final String active;
  final Widget? right;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lib = app.library;
    // Still loading with nothing arrived yet: show an ellipsis
    String n(String part, int count) =>
        count == 0 && (lib?.loading.contains(part) ?? false)
        ? '…'
        : _count(count);
    final l = context.l10n;
    final tabs = [
      (l.tabSongs, lib == null ? '0' : n('tracks', lib.tracks.length), 'songs'),
      (
        l.tabAlbums,
        lib == null ? '0' : n('albums', lib.albums.length),
        'albums',
      ),
      (
        l.tabPlaylists,
        lib == null ? '0' : n('playlists', lib.playlists.length),
        'playlists',
      ),
      (
        l.tabArtists,
        lib == null ? '0' : n('artists', lib.artists.length),
        'artists',
      ),
    ];
    final selected = math.max(0, tabs.indexWhere((t) => t.$3 == active));
    // The whole library is empty (no music source added, no local songs): show only the empty state, no tabs or Coverflow
    if (lib == null) return const SizedBox(height: _headerH);
    return SizedBox(
      height: _headerH,
      child: Stack(
        children: [
          // The library is a top-level sidebar page, so no back button.
          // Coverflow is another view of the current tab, so its entry sits at
          // the right end of the tab row, centered on the tabs (y = 86).
          Positioned(
            right: 40,
            top: 66,
            child: IconBtn(
              'coverflow',
              size: BtnSize.m,
              tip: 'Coverflow',
              onTap: () => app.go('/coverflow/$active'),
            ),
          ),
          Positioned(
            left: 40,
            // Right below the 72-high title bar drag area, level with the Settings title
            top: 72,
            child: LineTabs(
              showLine: false,
              items: [for (final t in tabs) (t.$1, t.$2)],
              selected: selected,
              onChanged: (i) => app.replace('/library/${tabs[i].$3}'),
            ),
          ),
          // Sort control sits left of the Coverflow button (40 wide + 24 gap)
          if (right != null) Positioned(right: 104, top: 77, child: right!),
        ],
      ),
    );
  }
}

String _count(int n) =>
    n < 1000 ? '$n' : '${n ~/ 1000},${(n % 1000).toString().padLeft(3, '0')}';

/// Albums on the record shelf: the current source's library.
List<Album> _shelf(AppState app) => app.library?.albums ?? const [];

/// Position of the empty state in the content area: in the final design the title is at window y≈360, laid out as if content started at 140.
/// The header has since moved up, so the extra top padding keeps the empty state where it was.
Widget _emptyAt(Widget child) => Padding(
  padding: const EdgeInsets.only(top: 140 - _headerH),
  child: Align(alignment: const Alignment(0, -0.3), child: child),
);

/// The whole library is empty: while scanning say so, otherwise prompt to add a music folder or install a plugin.
class _LibraryEmpty extends StatelessWidget {
  const _LibraryEmpty();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    if (app.scanning) {
      return _emptyAt(
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ScanningTitle(l.sourceScanning),
            const SizedBox(height: 12),
            // Reserve the line even before the first file so the title doesn't jump
            Opacity(
              opacity: app.scanProgress > 0 ? 1 : 0,
              child: tx(
                l.countSongs(app.scanProgress),
                14,
                w: w500,
                c: P.muted,
              ),
            ),
          ],
        ),
      );
    }
    return _emptyAt(
      EmptyMessage(
        title: l.libraryEmptyTitle,
        actions: [
          Btn(
            label: l.sourceAddMusicFolder,
            kind: BtnKind.primary,
            onTap: () async {
              final dir = await getDirectoryPath(
                confirmButtonText: l.actionAdd,
              );
              if (dir != null) await app.addMusicFolder(dir);
            },
          ),
          Btn(label: l.libraryAddSource, onTap: () => openPluginSettings(app)),
        ],
      ),
    );
  }
}

/// Scanning text: drop the trailing static ellipsis and use three dots fading in one after another to show progress;
/// the dots always take up space so the main text doesn't shift sideways.
class _ScanningTitle extends StatefulWidget {
  const _ScanningTitle(this.label);
  final String label;

  @override
  State<_ScanningTitle> createState() => _ScanningTitleState();
}

class _ScanningTitleState extends State<_ScanningTitle>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  /// Opacity of dot [i] (0..2) at cycle position [v] (0..1): fades in one by one, then all fade out at the end.
  double _dotOpacity(double v, int i) {
    final start = 0.20 + i * 0.22;
    if (v < start) return 0;
    if (v < start + 0.12) return (v - start) / 0.12;
    if (v < 0.90) return 1;
    return (1 - v) / 0.10;
  }

  @override
  Widget build(BuildContext context) {
    final base = widget.label.replaceFirst(RegExp(r'[…\.]+$'), '');
    final style = ts(30, w: w900, f: F.wide, c: P.ink);
    return Semantics(
      label: widget.label,
      excludeSemantics: true,
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (context, _) {
          final v = _ctrl.value;
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              CjkText(base, style: style),
              for (var i = 0; i < 3; i++)
                Opacity(
                  opacity: _dotOpacity(v, i).clamp(0.0, 1.0),
                  child: CjkText('.', style: style),
                ),
            ],
          );
        },
      ),
    );
  }
}

/// A library tab with no content yet: loading, error or empty.
Widget? _emptyState(
  BuildContext context,
  AppState app,
  String part,
  int count,
  String title,
) {
  final l = context.l10n;
  final lib = app.library;
  if (lib == null || count > 0) return null;
  final err = lib.errors[part];
  if (err != null) {
    return Notice(
      errorText(err),
      action: l.actionRetry,
      onAction: app.reloadLibrary,
    );
  }
  if (lib.loading.contains(part)) return Notice(l.stateLoading);
  return _emptyAt(
    EmptyMessage(
      title: title,
      actions: [Btn(label: l.actionGoSearch, onTap: () => app.go('/search'))],
    ),
  );
}

// ═════════════ Albums: record shelf ═════════════

/// Release year on the spine card, e.g. "2022"; empty if unknown.
String _releasedText(Album a) {
  final y = a.released?.year ?? a.year;
  return y > 0 ? '$y' : '';
}

/// Release time as a comparable number: the date if known, the start of the year if only the year, otherwise null.
double? _releasedAt(Album a) {
  final d = a.released;
  if (d != null) return d.year + (d.month - 1) / 12 + (d.day - 1) / 365;
  return a.year > 0 ? a.year.toDouble() : null;
}

class _AlbumsBody extends StatefulWidget {
  const _AlbumsBody();

  @override
  State<_AlbumsBody> createState() => _AlbumsBodyState();
}

class _AlbumsBodyState extends State<_AlbumsBody>
    with SingleTickerProviderStateMixin {
  final _focus = FocusNode();

  // Feel copied from Coverflow:
  // - the whole shelf is driven by one continuous position [_anim] (selected index, may be fractional);
  //   each record's position and how far it's pulled out are functions of it, with no separate animations;
  // - dragging (mouse and trackpad both through GestureDetector) moves one record per fixed [_dragPx];
  // - on release, continue 0.15 s at the current velocity, round, and spring into place; one record per wheel notch;
  // - the selection doesn't change while dragging, only when settled.
  late final AnimationController _anim = AnimationController.unbounded(
    vsync: this,
  )..addStatusListener((_) => mounted ? setState(() {}) : null);
  int _target = -1; // index to stop at; -1 means not positioned yet
  double? _drag; // continuous position while dragging

  /// Design size: shelf + timeline in a 760-high area (1440×900 window).
  static const _designH = 760.0;

  /// How far to drag (design pixels) per record, same as Coverflow.
  static const _dragPx = 115.0;

  List<Album> _order(int sort) {
    final list = List.of(_shelf(context.appRead));
    if (sort == 0) {
      list.sort(
        (a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()),
      );
    } else {
      // Release time: newest on the far left, unknown last, keeping their original order
      final at = {for (final (i, a) in list.indexed) a: i};
      list.sort((a, b) {
        final x = _releasedAt(a), y = _releasedAt(b);
        if (x != null && y != null && x != y) return y.compareTo(x);
        if (x != null && y == null) return -1;
        if (x == null && y != null) return 1;
        return at[a]!.compareTo(at[b]!);
      });
    }
    return list;
  }

  /// Selects record [i] and springs over to it.
  void _goTo(List<Album> list, int i) {
    _target = i.clamp(0, list.length - 1);
    _drag = null;
    _anim.animateTo(
      _target.toDouble(),
      duration: const Duration(milliseconds: 520),
      curve: const SpringCurve(bounce: 0.06),
    );
    final app = context.appRead;
    if (list[_target].id != app.shelfId) {
      app.update(() => app.shelfId = list[_target].id);
    }
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
    final list = _order(app.shelfSort);
    final empty = _emptyState(
      context,
      app,
      'albums',
      list.length,
      context.l10n.libraryNoAlbums,
    );
    if (empty != null || list.isEmpty) return empty ?? const SizedBox();
    final n = list.length;
    final sel = math.max(0, list.indexWhere((a) => a.id == app.shelfId));
    if (_target < 0) {
      // First display: stop right at the selected record
      _target = sel;
      _anim.value = sel.toDouble();
    } else if (sel != _target && _drag == null) {
      // Selection changed elsewhere (sorting, menu): slide over
      _target = sel;
      _anim.animateTo(
        sel.toDouble(),
        duration: const Duration(milliseconds: 520),
        curve: const SpringCurve(bounce: 0.06),
      );
    }
    return Focus(
      focusNode: _focus,
      autofocus: true,
      onKeyEvent: (_, e) {
        if (e is! KeyDownEvent && e is! KeyRepeatEvent) {
          return KeyEventResult.ignored;
        }
        if (e.logicalKey == LogicalKeyboardKey.arrowRight) {
          _goTo(list, _target + 1);
          return KeyEventResult.handled;
        }
        if (e.logicalKey == LogicalKeyboardKey.arrowLeft) {
          _goTo(list, _target - 1);
          return KeyEventResult.handled;
        }
        if (e.logicalKey == LogicalKeyboardKey.enter) {
          app.go(AppState.albumRoute(list[_target].id));
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      // The whole block scales with window height, with width converted proportionally, so proportions stay the same at any window size
      child: LayoutBuilder(
        builder: (context, box) {
          final s = (box.maxHeight / _designH).clamp(0.55, 2.0);
          return FittedBox(
            fit: BoxFit.contain,
            alignment: Alignment.topLeft,
            child: SizedBox(
              width: box.maxWidth / s,
              height: box.maxHeight / s,
              child: Column(
                children: [
                  const SizedBox(height: 4),
                  SizedBox(
                    height: 548,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onHorizontalDragStart: (_) {
                        _anim.stop();
                        _drag = _anim.value;
                      },
                      onHorizontalDragUpdate: (d) {
                        if (_drag == null) return;
                        _drag = (_drag! - d.delta.dx / _dragPx).clamp(
                          -0.4,
                          n - 1 + 0.4,
                        );
                        _anim.value = _drag!;
                      },
                      onHorizontalDragEnd: (d) {
                        if (_drag == null) return;
                        final v =
                            _drag! -
                            d.velocity.pixelsPerSecond.dx / _dragPx * 0.15;
                        _goTo(list, v.round());
                      },
                      onHorizontalDragCancel: () {
                        if (_drag != null) _goTo(list, _drag!.round());
                      },
                      child: Listener(
                        // One record per mouse wheel notch
                        onPointerSignal: (e) {
                          if (e is PointerScrollEvent) {
                            final d =
                                e.scrollDelta.dx.abs() > e.scrollDelta.dy.abs()
                                ? e.scrollDelta.dx
                                : e.scrollDelta.dy;
                            if (d.abs() > 4) {
                              _goTo(list, _target + d.sign.toInt());
                            }
                          }
                        },
                        child: Stack(
                          children: [
                            Positioned.fill(
                              child: AnimatedBuilder(
                                animation: _anim,
                                builder: (_, _) {
                                  final pos = _anim.value;
                                  final still =
                                      _drag == null && !_anim.isAnimating;
                                  return ClipRect(
                                    child: CustomMultiChildLayout(
                                      delegate: _CenterShelf(n: n, pos: pos),
                                      children: [
                                        for (var i = 0; i < n; i++)
                                          LayoutId(
                                            id: i,
                                            child: FadeIn(
                                              key: ValueKey(list[i].id),
                                              delay: math.min(
                                                (i - sel).abs() * 25,
                                                400,
                                              ),
                                              dy: 24,
                                              child: _ShelfItem(
                                                album: list[i],
                                                open: _shelfOpen(i, pos),
                                                still: still,
                                                onTap: () => i == _target
                                                    ? app.go(
                                                        AppState.albumRoute(
                                                          list[i].id,
                                                        ),
                                                      )
                                                    : _goTo(list, i),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                            // Fade out on both edges
                            for (final left in [true, false])
                              Positioned(
                                left: left ? 0 : null,
                                right: left ? null : 0,
                                top: 0,
                                bottom: 0,
                                width: 120,
                                child: IgnorePointer(
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: left
                                            ? Alignment.centerRight
                                            : Alignment.centerLeft,
                                        end: left
                                            ? Alignment.centerLeft
                                            : Alignment.centerRight,
                                        colors: [
                                          P.ground.withValues(alpha: 0),
                                          P.ground,
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // 12 from the shelf bottom to the timeline top (final · Library · Albums v16)
                  const SizedBox(height: 12),
                  _timeline(list, _target),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Timeline. Sorted by release time: when albums were added to the library, spread evenly per the design when all unknown;
  /// sorted by title: spread evenly in shelf order, with initials below (final · spine timeline D′).
  Widget _timeline(List<Album> list, int sel) {
    void pick(int i) => _goTo(list, i);
    if (context.appRead.shelfSort == 0) {
      String initial(Album a) {
        final t = a.title.trim();
        if (t.isEmpty) return '#';
        final c = t[0].toUpperCase();
        return RegExp('[A-Z]').hasMatch(c) ? c : '#';
      }

      final cur = initial(list[sel]);
      final seen = <String>{};
      final marks = <TickMark>[
        for (final (i, a) in list.indexed)
          if (seen.add(initial(a)))
            (
              pos: i.toDouble(),
              text: initial(a),
              strong: initial(a) == cur,
              level: 0,
            ),
      ];
      return _Timeline(
        from: 0,
        to: math.max(1, list.length - 1).toDouble(),
        positions: [for (var i = 0; i < list.length; i++) i.toDouble()],
        marks: marks,
        current: sel,
        hoverLabel: (_, i) => list[i].title,
        onPick: pick,
      );
    }
    // Release time: one slot per record like the shelf, newest on the left, so decades of span don't bunch up at one end.
    // Below, label the year at the first record of each year; when space is short, prefer whole decades, then half decades.
    int yearOf(Album a) => a.released?.year ?? a.year;
    final cur = yearOf(list[sel]);
    final marks = <TickMark>[];
    for (final (i, a) in list.indexed) {
      final y = yearOf(a);
      if (y <= 0 || (i > 0 && yearOf(list[i - 1]) == y)) continue;
      marks.add((
        pos: i.toDouble(),
        text: '$y',
        strong: y == cur,
        level: y % 10 == 0 ? 2 : (y % 5 == 0 ? 1 : 0),
      ));
    }
    String when(double _, int i) {
      final a = list[i], d = a.released;
      if (d != null) return '${d.year}.${d.month.toString().padLeft(2, '0')}';
      return a.year > 0 ? '${a.year}' : a.title;
    }

    return _Timeline(
      from: 0,
      to: math.max(1, list.length - 1).toDouble(),
      positions: [for (var i = 0; i < list.length; i++) i.toDouble()],
      marks: marks,
      current: sel,
      hoverLabel: when,
      onPick: pick,
    );
  }
}

/// How far record [i] is pulled out at continuous position [pos]: 1 at the center, back to a spine one slot away.
/// Like the front cover in Coverflow turning to the side, it depends only on the distance from the current position.
double _shelfOpen(int i, double pos) => (1 - (i - pos).abs()).clamp(0.0, 1.0);

/// Shelf layout: spines laid out left to right (spacing 4), shifted so the "current position" lands in the center.
/// [pos] can be fractional, interpolating between neighbouring centers; each width is also a function of pos,
/// so the same pos always gives the same layout, and dragging, resting and animating never jitter.
class _CenterShelf extends MultiChildLayoutDelegate {
  _CenterShelf({required this.n, required this.pos});
  final int n;
  final double pos;

  @override
  void performLayout(Size size) {
    final sizes = <Size>[];
    for (var i = 0; i < n; i++) {
      sizes.add(layoutChild(i, BoxConstraints.loose(size)));
    }
    final centers = <double>[];
    var x = 0.0;
    for (final sz in sizes) {
      centers.add(x + sz.width / 2);
      x += sz.width + 4;
    }
    // Allow dragging a little past both ends (rubber band), extrapolating from the outermost slot
    final double anchor;
    if (n == 1) {
      anchor = centers[0] + pos * 48;
    } else {
      final lo = pos.floor().clamp(0, n - 2);
      anchor = centers[lo] + (centers[lo + 1] - centers[lo]) * (pos - lo);
    }
    final shift = size.width / 2 - anchor;
    x = 0;
    for (var i = 0; i < n; i++) {
      positionChild(i, Offset(shift + x, size.height - sizes[i].height));
      x += sizes[i].width + 4;
    }
  }

  @override
  bool shouldRelayout(_CenterShelf old) => old.n != n || old.pos != pos;
}

class _ShelfItem extends StatelessWidget {
  const _ShelfItem({
    required this.album,
    required this.open,
    required this.still,
    required this.onTap,
  });
  final Album album;

  /// How far it's pulled out, 0–1, computed directly from the shelf's continuous position (see [_shelfOpen]).
  final double open;

  /// The shelf is at rest; only at rest does hovering lift the spine.
  final bool still;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: CoverColors.instance,
      builder: (context, _) => _build(context),
    );
  }

  Widget _build(BuildContext context) {
    final al = album;
    // Spines and cards use colors extracted from the cover
    final pal = CoverColors.instance.peek(al.cover) ?? CoverPalette.fallback;
    final bg = pal.card;
    final fg = pal.onCard;
    return Tap(
      onTap: onTap,
      onMenu: (p) => showMenu(context, p, albumMenu(context, al)),
      builder: (_, h, _) => Builder(
        builder: (context) {
          final o = open;
          final w = al.spine + (420 - al.spine) * o;
          final hgt = 512 + 36 * o;
          return AnimatedSlide(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            offset: Offset(0, h && still && o == 0 ? -10 / hgt : 0),
            child: Container(
              width: math.max(w, 1),
              height: hgt,
              margin: EdgeInsets.symmetric(horizontal: 8 * o),
              decoration: squircle(
                8 + 10 * o,
                color: bg,
                shadows: o > 0.01
                    ? [
                        BoxShadow(
                          color: ba(0.67 * o),
                          blurRadius: 48,
                          offset: Offset(0, 24 * o),
                          spreadRadius: -8,
                        ),
                      ]
                    : null,
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                clipBehavior: Clip.hardEdge,
                children: [
                  // Spine
                  if (o < 0.6)
                    Positioned.fill(
                      child: Opacity(
                        opacity: (1 - o / 0.6).clamp(0.0, 1.0),
                        child: OverflowBox(
                          alignment: Alignment.topLeft,
                          maxWidth: al.spine,
                          minWidth: al.spine,
                          child: Stack(
                            children: [
                              Positioned(
                                top: 18,
                                left: 0,
                                right: 0,
                                height: hgt - al.spine - 30,
                                child: RotatedBox(
                                  quarterTurns: 1,
                                  // Align loosens the cross-axis constraint so text centers within the spine width
                                  child: Align(
                                    alignment: Alignment.centerLeft,
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.baseline,
                                      textBaseline: TextBaseline.alphabetic,
                                      children: [
                                        Flexible(
                                          child: tx(
                                            al.title,
                                            15,
                                            w: w800,
                                            f: F.semi,
                                            c: fg,
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        tx(
                                          al.artist,
                                          11,
                                          w: w600,
                                          c: fg.withValues(alpha: 0.7),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                left: 6,
                                bottom: 6,
                                child: Cover(
                                  al.cover,
                                  w: al.spine - 12,
                                  h: al.spine - 12,
                                  r: 4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  // The pulled-out card
                  if (o > 0.4)
                    Positioned(
                      left: 20,
                      top: 20,
                      child: Opacity(
                        opacity: ((o - 0.4) / 0.6).clamp(0.0, 1.0),
                        // Constrain width only: fallback fonts for CJK titles have taller line heights, so a fixed height would overflow
                        child: SizedBox(
                          width: 380,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Cover(al.cover, w: 380, h: 380, r: 10),
                              const SizedBox(height: 10),
                              tx(al.title, 30, w: w900, f: F.wide, c: fg),
                              const SizedBox(height: 6),
                              Padding(
                                padding: const EdgeInsets.only(left: 2),
                                // Leave a gap between artist and release year, with the year a bit fainter
                                child: Row(
                                  children: [
                                    Flexible(
                                      child: tx(
                                        al.artist,
                                        13,
                                        w: w600,
                                        c: fg.withValues(alpha: 0.75),
                                      ),
                                    ),
                                    if (_releasedText(al).isNotEmpty) ...[
                                      const SizedBox(width: 12),
                                      tx(
                                        _releasedText(al),
                                        13,
                                        w: w600,
                                        c: fg.withValues(alpha: 0.5),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Tap(
                                    tip: context.l10n.actionPlay,
                                    // Play the whole album (plugins fetch the tracks first)
                                    onTap: () =>
                                        context.appRead.playAlbumById(al.id),
                                    builder: (_, h, p) => PressScale(
                                      pressed: p,
                                      hover: h,
                                      up: 1.06,
                                      child: Container(
                                        width: 56,
                                        height: 56,
                                        decoration: const BoxDecoration(
                                          color: white,
                                          shape: BoxShape.circle,
                                        ),
                                        alignment: Alignment.center,
                                        // The icon's triangle is already placed at its visual center; no extra shift right
                                        child: const Ico(
                                          'play',
                                          size: 24,
                                          color: darkInk,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Builder(
                                    builder: (ctx) => IconBtn(
                                      'more',
                                      size: BtnSize.m,
                                      onCover: true,
                                      onLightCover: pal.darkText,
                                      tip: context.l10n.actionMore,
                                      onTap: () {
                                        final box =
                                            ctx.findRenderObject() as RenderBox;
                                        showMenu(
                                          ctx,
                                          box.localToGlobal(
                                            Offset(0, box.size.height + 6),
                                          ),
                                          albumMenu(ctx, al),
                                        );
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// The "water column" ticks below the shelf (final · spine timeline, hover style D):
/// the bulge follows only the current album; the column under the cursor becomes a white 60% pointer, with its time or album name above.
class _Timeline extends StatefulWidget {
  const _Timeline({
    required this.positions,
    required this.current,
    required this.onPick,
    required this.hoverLabel,
    this.from = 2019,
    this.to = 2026,
    this.marks,
  });
  final List<double> positions;

  /// Start and end of the ticks (years when sorted by release time, album index when sorted by title).
  final double from, to;
  final int current;
  final ValueChanged<int> onPick;

  /// Text above the pointer: arguments are the tick value at the cursor and the nearest album.
  final String Function(double pos, int nearest) hoverLabel;

  /// Tick labels at the bottom; labelled by year when empty.
  final List<TickMark>? marks;

  @override
  State<_Timeline> createState() => _TimelineState();
}

class _TimelineState extends State<_Timeline> {
  double? _hx;
  // Kept after leaving so the pointer is drawn in place while fading out
  double _lastHx = 0;

  int _nearest(double pos) {
    var best = 0;
    var bd = double.infinity;
    for (var i = 0; i < widget.positions.length; i++) {
      final dd = (widget.positions[i] - pos).abs();
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    }
    return best;
  }

  @override
  Widget build(BuildContext context) {
    final from = widget.from, to = widget.to;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: LayoutBuilder(
        builder: (context, box) {
          final w = box.maxWidth;
          final span = (w - 3) / (to - from);
          final curX = (widget.positions[widget.current] - from) * span;
          // Snap the pointer to the nearest tick
          final n = ((w - 3) / TicksPainter.step).floor();
          final hi = (_lastHx / TicksPainter.step).round().clamp(0, n);
          final hpos = from + hi * TicksPainter.step / span;
          return MouseRegion(
            cursor: SystemMouseCursors.click,
            onHover: (e) => setState(() => _hx = _lastHx = e.localPosition.dx),
            onExit: (_) => setState(() => _hx = null),
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTapUp: (d) =>
                  widget.onPick(_nearest(from + d.localPosition.dx / span)),
              child: TweenAnimationBuilder<double>(
                tween: Tween(end: curX),
                duration: const Duration(milliseconds: 420),
                curve: Curves.easeOutCubic,
                builder: (_, cx, _) => TweenAnimationBuilder<double>(
                  tween: Tween(end: _hx != null ? 1 : 0),
                  duration: const Duration(milliseconds: 120),
                  curve: Curves.easeOut,
                  builder: (_, t, _) => CustomPaint(
                    size: Size(w, TicksPainter.height),
                    painter: TicksPainter(
                      curX: cx,
                      hover: hi,
                      hoverT: t,
                      hoverLabel: t > 0
                          ? widget.hoverLabel(hpos, _nearest(hpos))
                          : '',
                      from: from,
                      to: to,
                      marks: widget.marks,
                      ink: P.dark ? white : darkInk,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Tick labels: [pos] is in the same unit as the timeline's tick values.
/// When space is short, keep [strong] first, then by [level] from high to low, and by order within a level.
typedef TickMark = ({double pos, String text, bool strong, int level});

/// Horizontal ticks.
class TicksPainter extends CustomPainter {
  TicksPainter({
    required this.curX,
    required this.from,
    required this.to,
    required this.ink,
    this.hover = -1,
    this.hoverT = 0,
    this.hoverLabel = '',
    this.marks,
  });
  final double curX, from, to, hoverT;
  final int hover;
  final String hoverLabel;
  final List<TickMark>? marks;
  final Color ink;

  static const step = 11.5;

  /// Matches the final Shelf Timeline (relative to the column bottom [base]):
  /// hover text 0–12, triangle 12–18, a 6 gap, current column 24–44, tick labels from 54.
  static const label = 12.0, arrow = 6.0, gap = 6.0, column = 20.0;
  static const base = label + arrow + gap + column, height = base + 24;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final strong = Paint()..color = ink;
    // Snap the current position to the nearest tick; the white column, triangle and bulge all follow it
    final n = ((w - 3) / step).floor();
    final ci = (curX / step).round().clamp(0, n);
    final cx = ci * step;
    for (var i = 0; i <= n; i++) {
      final x = i * step;
      final d = x - curX;
      var h = 5 + 15 * math.exp(-(d * d) / (2 * 34 * 34));
      var a = 0.28;
      if (i == hover && i != ci) {
        h += (20 - h) * hoverT;
        a += (0.6 - a) * hoverT;
      }
      canvas.drawRSuperellipse(
        RSuperellipse.fromRectAndRadius(
          Rect.fromLTWH(x, base - (i == ci ? 20 : h), 3, i == ci ? 20 : h),
          const Radius.circular(1.5),
        ),
        i == ci ? strong : (Paint()..color = ink.withValues(alpha: a)),
      );
    }
    // Triangle 10×6, its tip [gap] above the top of the current column
    const triTip = base - column - gap;
    final tri = Path()
      ..moveTo(cx - 3.5, triTip - arrow)
      ..lineTo(cx + 6.5, triTip - arrow)
      ..lineTo(cx + 1.5, triTip)
      ..close();
    canvas.drawPath(tri, strong);
    // Time / album name above the pointer, on the line above the triangle
    if (hoverT > 0 && hover != ci && hoverLabel.isNotEmpty) {
      final tp = TextPainter(
        text: cjkSpan(
          hoverLabel,
          ts(
            11,
            w: w600,
            h: 12 / 11,
            c: ink.withValues(alpha: 0.9 * hoverT),
          ),
        ),
        textDirection: TextDirection.ltr,
        maxLines: 1,
        ellipsis: '…',
      )..layout(maxWidth: 240);
      final hx = hover * step + 1.5;
      final lx = (hx - tp.width / 2)
          .clamp(0.0, math.max(0.0, w - tp.width))
          .toDouble();
      tp.paint(canvas, Offset(lx, label - tp.height));
    }
    final ms =
        marks ??
        [
          for (var y = from.ceil(); y <= to; y++)
            (pos: y.toDouble(), text: '$y', strong: false, level: 0),
        ];
    // Lay out every label's position first, then place them by priority, skipping any that collide with ones already placed
    final laid = <(TickMark, TextPainter, double)>[];
    for (final (i, m) in ms.indexed) {
      final x = (m.pos - from) / (to - from) * (w - 3);
      final tp = TextPainter(
        text: cjkSpan(
          m.text,
          ts(
            11,
            w: m.strong ? w700 : w600,
            h: 12 / 11,
            c: ink.withValues(alpha: m.strong ? 1 : 0.4),
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      var lx = x - tp.width / 2 + 1.5;
      if (marks == null && i == 0) lx = 0;
      if (marks == null && i == ms.length - 1) lx = w - tp.width;
      laid.add((m, tp, lx.clamp(0.0, math.max(0.0, w - tp.width)).toDouble()));
    }
    final order = [for (var i = 0; i < laid.length; i++) i]
      ..sort((a, b) {
        final x = laid[a].$1, y = laid[b].$1;
        if (x.strong != y.strong) return x.strong ? -1 : 1;
        if (x.level != y.level) return y.level - x.level;
        return a - b;
      });
    const minGap = 10.0;
    final placed = <(double, double)>[];
    for (final k in order) {
      final (_, tp, lx) = laid[k];
      final rx = lx + tp.width;
      if (placed.any((p) => lx < p.$2 + minGap && rx > p.$1 - minGap)) {
        continue;
      }
      placed.add((lx, rx));
      tp.paint(canvas, Offset(lx, base + 10));
    }
  }

  @override
  bool shouldRepaint(TicksPainter old) =>
      old.curX != curX ||
      old.hover != hover ||
      old.hoverT != hoverT ||
      old.hoverLabel != hoverLabel ||
      old.marks != marks ||
      old.ink != ink;
}

// ═════════════ Songs ═════════════

const _songsTopPad = 28.0;
const _songsBottomPad = 200.0;
const _songRowH = 52.0;
const _firstMonthH = 36.0;
const _monthH = 58.0;

class _SongsBody extends StatefulWidget {
  const _SongsBody();

  @override
  State<_SongsBody> createState() => _SongsBodyState();
}

class _SongsBodyState extends State<_SongsBody> {
  final _scroll = ScrollController();
  final _frac = ValueNotifier(0.0);
  double _maxExtent = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      final max = _maxExtent > 0
          ? _maxExtent
          : _scroll.position.maxScrollExtent;
      _frac.value = max <= 0 ? 0 : (_scroll.offset / max).clamp(0.0, 1.0);
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    _frac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final lib = app.library!;
    final empty = _emptyState(
      context,
      app,
      'tracks',
      lib.tracks.length,
      l.libraryNoSongs,
    );
    if (empty != null) return empty;
    final tracks = _byAdded(lib.tracks);
    final months = _months(tracks, l);
    // One per row: a month header or a song. There may be thousands of songs, so build on demand.
    final rows =
        <(({SongMonth month, int? year, int? monthNum}), SongRow?, int)>[];
    final rowStarts = <double>[];
    final rowEnds = <double>[];
    var y = 0.0;
    for (final m in months) {
      final gap = rows.isEmpty ? 0 : 1;
      rows.add((m, null, gap));
      rowStarts.add(y);
      y += gap == 0 ? _firstMonthH : _monthH;
      rowEnds.add(y);
      for (final r in m.month.rows) {
        rows.add((m, r, 0));
        rowStarts.add(y);
        y += _songRowH;
        rowEnds.add(y);
      }
    }
    final rowsTotalH = y;
    final seconds = tracks.fold<int>(0, (a, t) => a + t.seconds);
    String monthLabel(({SongMonth month, int? year, int? monthNum}) m) =>
        m.year == null || m.monthNum == null
        ? m.month.label
        : '${m.year}.${'${m.monthNum}'.padLeft(2, '0')}';
    int rowAtOffset(double scrollY) {
      var lo = 0, hi = rows.length - 1;
      while (lo < hi) {
        final mid = (lo + hi) >> 1;
        if (_songsTopPad + rowEnds[mid] > scrollY) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return lo;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(40, 8, 40, 0),
          child: SizedBox(
            height: 40,
            child: Row(
              children: [
                PlayPill(
                  height: 40,
                  onTap: () =>
                      app.playList(tracks, from: 'library', shuffled: false),
                ),
                const SizedBox(width: 8),
                SoftPill(
                  label: l.actionShuffle,
                  icon: 'shuffle',
                  onTap: () =>
                      app.playList(tracks, from: 'library', shuffled: true),
                ),
                const Spacer(),
                tx(_hours(seconds, l), 13, w: w600, c: P.faint),
              ],
            ),
          ),
        ),
        Expanded(
          child: LayoutBuilder(
            builder: (context, box) {
              final totalExtent = _songsTopPad + rowsTotalH + _songsBottomPad;
              final maxExtent = math.max(0.0, totalExtent - box.maxHeight);
              _maxExtent = maxExtent;
              final marks = <YearMark>[];
              final seenYears = <int>{};
              for (var i = 0; i < rows.length; i++) {
                final (m, r, _) = rows[i];
                if (r != null || m.year == null || !seenYears.add(m.year!)) {
                  continue;
                }
                final target = i == 0 ? 0.0 : _songsTopPad + rowStarts[i];
                final frac = maxExtent > 0
                    ? (target / maxExtent).clamp(0.0, 1.0)
                    : (rowsTotalH > 0
                          ? (rowStarts[i] / rowsTotalH).clamp(0.0, 1.0)
                          : 0.0);
                marks.add((
                  label: '${m.year}',
                  frac: frac,
                  hoverLabel: monthLabel(m),
                ));
              }
              return Stack(
                children: [
                  ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.fromLTRB(
                      32,
                      _songsTopPad,
                      122,
                      _songsBottomPad,
                    ),
                    itemCount: rows.length,
                    itemExtentBuilder: (i, _) {
                      final (_, r, gap) = rows[i];
                      if (r != null) return _songRowH;
                      return gap == 0 ? _firstMonthH : _monthH;
                    },
                    itemBuilder: (_, i) {
                      final (m, r, gap) = rows[i];
                      if (r == null) {
                        return Padding(
                          padding: EdgeInsets.fromLTRB(
                            8,
                            gap == 0 ? 0 : 22,
                            8,
                            17,
                          ),
                          child: Row(
                            children: [
                              tx(m.month.label, 12, w: w500, c: P.faint),
                              const Spacer(),
                              tx(m.month.count, 12, w: w500, c: P.faint),
                            ],
                          ),
                        );
                      }
                      return FadeIn(
                        delay: math.min(i, 12) * 25,
                        child: _SongRowView(
                          row: r,
                          track: tracks[r.n - 1],
                          onPlay: () => app.playList(
                            tracks,
                            start: r.n - 1,
                            from: 'library',
                          ),
                        ),
                      );
                    },
                  ),
                  Positioned(
                    right: 24,
                    top: 24,
                    child: ValueListenableBuilder(
                      valueListenable: _frac,
                      builder: (_, frac, _) => _YearScrubber(
                        frac: frac,
                        marks: marks,
                        labelAt: (f) {
                          if (rows.isEmpty) return '';
                          final scrollY = maxExtent > 0
                              ? f * maxExtent
                              : _songsTopPad + f * rowsTotalH;
                          return monthLabel(rows[rowAtOffset(scrollY)].$1);
                        },
                        onPick: (f) {
                          if (!_scroll.hasClients || maxExtent <= 0) return;
                          _scroll.animateTo(
                            (f * maxExtent).clamp(0.0, maxExtent),
                            duration: const Duration(milliseconds: 420),
                            curve: Curves.easeOutCubic,
                          );
                        },
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Newest first; unknown times last, keeping their original order.
List<Track> _byAdded(List<Track> ts) {
  final list = List.of(ts);
  final at = {for (final (i, t) in list.indexed) t: i};
  list.sort((a, b) {
    final x = a.added, y = b.added;
    if (x != null && y != null) return y.compareTo(x);
    if (x != null) return -1;
    if (y != null) return 1;
    return at[a]!.compareTo(at[b]!);
  });
  return list;
}

/// Grouped by month added; [ts] is already sorted by time. Row numbers are the position in [ts] + 1.
List<({SongMonth month, int? year, int? monthNum})> _months(
  List<Track> ts,
  AppLocalizations l,
) {
  final out = <({SongMonth month, int? year, int? monthNum})>[];
  var label = '', rows = <SongRow>[];
  int? curYear, curMonth;
  void flush() {
    if (rows.isNotEmpty) {
      out.add((
        month: SongMonth(label, l.countTracks(rows.length), rows),
        year: curYear,
        monthNum: curMonth,
      ));
    }
  }

  for (final (i, t) in ts.indexed) {
    final d = t.added;
    final lbl = d == null ? l.libraryEarlier : l.dateYearMonth(d.year, d.month);
    if (lbl != label) {
      flush();
      label = lbl;
      curYear = d?.year;
      curMonth = d?.month;
      rows = [];
    }
    rows.add(
      SongRow(i + 1, t.title, t.artist, t.album, addedText(d), t.dur, t.cover),
    );
  }
  flush();
  return out;
}

/// Text for the "Date added" column: today, yesterday, n days ago, month and day.
String addedText(DateTime? d) {
  if (d == null) return '';
  final now = DateTime.now();
  final days = DateTime(
    now.year,
    now.month,
    now.day,
  ).difference(DateTime(d.year, d.month, d.day)).inDays;
  if (days <= 0) return L.timeToday;
  if (days == 1) return L.timeYesterday;
  if (days < 7) return L.timeDaysAgo(days);
  if (d.year == now.year) return L.dateMonthDay(d.month, d.day);
  return L.dateYearMonthDay(d.year, d.month, d.day);
}

String _hours(int seconds, AppLocalizations l) => seconds >= 3600
    ? l.durationHours((seconds / 3600).round())
    : l.durationMinutes((seconds / 60).round());

class _SongRowView extends StatelessWidget {
  const _SongRowView({
    required this.row,
    required this.track,
    required this.onPlay,
  });
  final SongRow row;
  final Track track;

  /// Plays from this song (the whole list goes into the queue).
  final VoidCallback onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final s = row;
    final playing = app.track.key == track.key;
    final liked = app.liked.contains(track.key);
    void play() => playing ? app.togglePlay() : onPlay();
    return Tap(
      onDoubleTap: play,
      onMenu: (p) => showMenu(context, p, trackMenu(context, track)),
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        height: 52,
        decoration: squircle(
          14,
          color: playing || h ? P.surface : P.surface.withValues(alpha: 0),
        ),
        child: Row(
          children: [
            RowIndex(
              n: s.n,
              hover: h,
              current: playing,
              playing: app.playing,
              width: 48,
              align: Alignment.center,
              onTap: play,
            ),
            Cover(s.cover, w: 40, h: 40, r: 8),
            const SizedBox(width: 12),
            SizedBox(
              width: 456,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(
                    s.title,
                    15,
                    w: w700,
                    f: F.semi,
                    c: playing ? accent : P.ink,
                  ),
                  const SizedBox(height: 4),
                  LinkText(
                    joinLinks([artistLinks(app, track)]),
                    style: ts(13, w: w500, c: P.muted),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: 300,
              child: LinkText(
                albumLinks(app, track),
                style: ts(13, w: w500, c: P.muted),
              ),
            ),
            Expanded(
              child: tx(s.added, 13, w: w500, c: P.faint),
            ),
            // Same as the album page: a heart appears on hover, liked songs always show a red heart
            AnimatedOpacity(
              duration: fast,
              opacity: h || liked ? 1 : 0,
              child: HeartSmall(
                liked: liked,
                onTap: () => app.toggleLike(track),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 36,
              child: tx(
                s.dur,
                13,
                w: w500,
                c: P.faint,
                tnum: true,
                align: TextAlign.right,
              ),
            ),
            const SizedBox(width: 8),
          ],
        ),
      ),
    );
  }
}

class HeartSmall extends StatelessWidget {
  const HeartSmall({
    super.key,
    required this.liked,
    required this.onTap,
    this.color,
  });
  final bool liked;
  final VoidCallback onTap;

  /// Color when not liked, P.muted by default (the album page passes the duration color)
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Tap(
      tip: liked ? context.l10n.actionUnlike : context.l10n.actionLike,
      onTap: onTap,
      builder: (_, h, p) => SizedBox(
        width: 28,
        height: 28,
        child: Center(
          child: TweenAnimationBuilder<double>(
            key: ValueKey(liked),
            tween: Tween(begin: liked ? 1.4 : 0.8, end: 1),
            duration: const Duration(milliseconds: 400),
            curve: bouncy,
            builder: (_, sc, c) =>
                Transform.scale(scale: sc * (p ? 0.85 : 1), child: c),
            child: Ico(
              liked ? 'heart-filled' : 'heart',
              size: 16,
              color: liked ? heart : (h ? P.ink : (color ?? P.muted)),
            ),
          ),
        ),
      ),
    );
  }
}

/// A year label on the Songs vertical scrubber rail, positioned at the
/// scroll fraction [frac] where that year's songs begin.
typedef YearMark = ({String label, double frac, String hoverLabel});

/// A laid-out year label on the Songs vertical rail.
typedef PlacedYearMark = ({YearMark mark, int tick, double top, double bottom});

/// The vertical "water column" ticks to the right of the song list, the same as the one under the album shelf (hover style D):
/// the bulge follows only the current position; the column under the cursor becomes a white 60% pointer, with its month on the left.
class _YearScrubber extends StatefulWidget {
  const _YearScrubber({
    required this.frac,
    required this.onPick,
    this.marks = const [],
    this.labelAt,
  });
  final double frac;

  /// Year markers from newest to oldest, each carrying the scroll fraction
  /// where that year's songs begin.
  final List<YearMark> marks;
  final ValueChanged<double> onPick;

  /// Time at scroll position [0, 1], written next to the pointer.
  final String Function(double frac)? labelAt;

  @override
  State<_YearScrubber> createState() => _YearScrubberState();
}

class _YearScrubberState extends State<_YearScrubber> {
  Offset? _hoverPos;
  // Kept after leaving so the pointer is drawn in place while fading out
  Offset _lastPos = Offset.zero;
  late List<PlacedYearMark> _placed;

  @override
  void initState() {
    super.initState();
    _placed = YearTicksPainter.layoutMarks(widget.marks);
  }

  @override
  void didUpdateWidget(_YearScrubber oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!listEquals(oldWidget.marks, widget.marks)) {
      _placed = YearTicksPainter.layoutMarks(widget.marks);
    }
  }

  ({int tick, double frac, YearMark? mark}) _resolve(Offset local) {
    if (local.dx >= YearTicksPainter.right) {
      for (final p in _placed) {
        if (local.dy >= p.top - 2 && local.dy <= p.bottom + 2) {
          return (tick: p.tick, frac: p.mark.frac, mark: p.mark);
        }
      }
    }
    final tick = ((local.dy - 1.5) / YearTicksPainter.step).round().clamp(
      0,
      YearTicksPainter.n - 1,
    );
    for (final p in _placed) {
      if (p.tick == tick) {
        return (tick: tick, frac: p.mark.frac, mark: p.mark);
      }
    }
    return (tick: tick, frac: YearTicksPainter.fracForY(local.dy), mark: null);
  }

  @override
  Widget build(BuildContext context) {
    final cur = YearTicksPainter.tickForFrac(widget.frac);
    final resolved = _resolve(_lastPos);
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onHover: (e) => setState(() => _hoverPos = _lastPos = e.localPosition),
      onExit: (_) => setState(() => _hoverPos = null),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapUp: (d) => widget.onPick(_resolve(d.localPosition).frac),
        onVerticalDragUpdate: (d) =>
            widget.onPick(YearTicksPainter.fracForY(d.localPosition.dy)),
        child: TweenAnimationBuilder<double>(
          tween: Tween(end: _hoverPos != null ? 1 : 0),
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          builder: (_, t, _) => CustomPaint(
            size: const Size(44, YearTicksPainter.railHeight),
            painter: YearTicksPainter(
              cur: cur,
              hover: resolved.tick,
              hoverT: t,
              hoverLabel: t > 0
                  ? (resolved.mark?.hoverLabel ??
                        widget.labelAt?.call(
                          YearTicksPainter.fracForTick(resolved.tick),
                        ) ??
                        '')
                  : '',
              ink: P.dark ? white : darkInk,
              placedMarks: _placed,
            ),
          ),
        ),
      ),
    );
  }
}

class YearTicksPainter extends CustomPainter {
  YearTicksPainter({
    required this.cur,
    required this.ink,
    this.hover = -1,
    this.hoverT = 0,
    this.hoverLabel = '',
    this.placedMarks = const [],
  });
  final int cur, hover;
  final double hoverT;
  final String hoverLabel;
  final Color ink;
  final List<PlacedYearMark> placedMarks;

  static const n = 56;
  static const step = 9.786;
  static const railHeight = n * step;
  static const right = 20.0;
  static const _labelGap = 6.0;

  static int tickForFrac(double frac) =>
      (3 + frac.clamp(0.0, 1.0) * (n - 4)).round().clamp(3, n - 1);

  static double yForTick(int tick) => tick * step + 1.5;

  static double fracForTick(int tick) => ((tick - 3) / (n - 4)).clamp(0.0, 1.0);

  static double fracForY(double y) =>
      (((y - 1.5) / step - 3) / (n - 4)).clamp(0.0, 1.0);

  static List<PlacedYearMark> layoutMarks(List<YearMark> marks) {
    final placed = <PlacedYearMark>[];
    for (final m in marks) {
      final tick = tickForFrac(m.frac);
      final cy = yForTick(tick);
      final tp = TextPainter(
        text: cjkSpan(m.label, ts(10, w: w600, c: white)),
        textDirection: TextDirection.ltr,
      )..layout();
      final len = tp.width;
      final top = (cy - len / 2)
          .clamp(0.0, math.max(0.0, railHeight - len))
          .toDouble();
      final bottom = top + len;
      if (placed.any(
        (p) => top < p.bottom + _labelGap && bottom > p.top - _labelGap,
      )) {
        continue;
      }
      placed.add((mark: m, tick: tick, top: top, bottom: bottom));
    }
    return placed;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final strong = Paint()..color = ink;
    final peak = yForTick(cur);
    for (var i = 0; i < n; i++) {
      final y = i * step;
      final d = y + 1.5 - peak;
      var w = 5 + 12 * math.exp(-(d * d) / (2 * 26 * 26));
      var a = 0.28;
      if (i == cur) {
        w = 17;
        a = 1;
      } else if (i == hover) {
        w += (17 - w) * hoverT;
        a += (0.6 - a) * hoverT;
      }
      canvas.drawRSuperellipse(
        RSuperellipse.fromRectAndRadius(
          Rect.fromLTWH(right - w, y, w, 3),
          const Radius.circular(1.5),
        ),
        i == cur ? strong : (Paint()..color = ink.withValues(alpha: a)),
      );
    }
    final tri = Path()
      ..moveTo(right - 26, peak - 5)
      ..lineTo(right - 26, peak + 5)
      ..lineTo(right - 21, peak)
      ..close();
    canvas.drawPath(tri, strong);
    // Time next to the pointer, in the triangle's column: right-aligned and vertically centered on the column
    if (hoverT > 0 && hover != cur && hoverLabel.isNotEmpty) {
      final tp = TextPainter(
        text: cjkSpan(
          hoverLabel,
          ts(
            11,
            w: w600,
            c: ink.withValues(alpha: 0.9 * hoverT),
          ),
        ),
        textDirection: TextDirection.ltr,
        maxLines: 1,
      )..layout();
      tp.paint(
        canvas,
        Offset(right - 21 - tp.width, yForTick(hover) - tp.height / 2),
      );
    }
    for (final p in placedMarks) {
      final tp = TextPainter(
        text: cjkSpan(
          p.mark.label,
          ts(10, w: w600, c: ink.withValues(alpha: 0.4)),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      canvas.save();
      canvas.translate(33 + tp.height, p.top);
      canvas.rotate(math.pi / 2);
      tp.paint(canvas, Offset.zero);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(YearTicksPainter old) =>
      old.cur != cur ||
      old.hover != hover ||
      old.hoverT != hoverT ||
      old.hoverLabel != hoverLabel ||
      old.ink != ink ||
      !listEquals(old.placedMarks, placedMarks);
}

// ═════════════ Playlists ═════════════

int _playlistTab = 0;

class _PlaylistTabs extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    return TextTabs(
      labels: [l.actionAll, l.libraryCreatedByMe, l.libraryCollected],
      selected: _playlistTab,
      onChanged: (i) => app.update(() => _playlistTab = i),
    );
  }
}

class _PlaylistsBody extends StatelessWidget {
  const _PlaylistsBody();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final lib = app.library!;
    final source = app.sourceId;
    final all = [
      for (final p in lib.playlists)
        PlaylistCard(
          p.id,
          p.name,
          p.mine
              ? (p.trackCount > 0
                    ? l.countTracks(p.trackCount)
                    : l.libraryCreatedByMe)
              : (p.owner.isEmpty ? l.libraryCollected : p.owner),
          p.imageUrl,
          p.mine,
        ),
    ];
    final empty = _emptyState(
      context,
      app,
      'playlists',
      all.length,
      l.libraryNoPlaylists,
    );
    if (empty != null) return empty;
    final list = all
        .where((p) => _playlistTab == 0 || (_playlistTab == 1) == p.mine)
        .toList();
    return LayoutBuilder(
      builder: (context, box) {
        final cw = ((box.maxWidth - 80 - 3 * 16) / 4).floorToDouble();
        return AnimatedSwitcher(
          transitionBuilder: fadeOnly,
          duration: const Duration(milliseconds: 260),
          child: SingleChildScrollView(
            key: ValueKey(_playlistTab),
            padding: const EdgeInsets.fromLTRB(40, 8, 40, 120),
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                for (final (i, p) in list.indexed)
                  FadeIn(
                    delay: i * 40,
                    dy: 16,
                    child: _PlaylistCardView(
                      card: p,
                      width: cw,
                      route: AppState.remoteRoute('playlist', source, p.id),
                      onPlay: () => app.playPlaylist(source, p.id),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _PlaylistCardView extends StatelessWidget {
  const _PlaylistCardView({
    required this.card,
    required this.width,
    required this.route,
    required this.onPlay,
  });
  final PlaylistCard card;
  final double width;
  final String route;
  final Future<void> Function() onPlay;

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final p = card;
    // Card background and text color are both extracted from the cover
    final pal = CoverColors.instance.peek(p.cover) ?? CoverPalette.fallback;
    final fg = pal.onCard;
    return Tap(
      onTap: () => app.go(route),
      onMenu: (pos) => showMenu(
        context,
        pos,
        playlistMenu(
          context,
          title: p.title,
          meta: p.meta,
          cover: p.cover,
          onPlay: onPlay,
        ),
      ),
      builder: (_, h, _) => AnimatedSlide(
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOutCubic,
        offset: Offset(0, h ? -6 / 314 : 0),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          width: width,
          height: 314,
          padding: const EdgeInsets.all(8),
          decoration: squircle(
            24,
            color: pal.card,
            shadows: [
              BoxShadow(
                color: ba(h ? 0.6 : 0),
                blurRadius: 40,
                offset: const Offset(0, 18),
                spreadRadius: -10,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRSuperellipse(
                borderRadius: BorderRadius.circular(18),
                child: SizedBox(
                  height: 206,
                  width: double.infinity,
                  child: AnimatedScale(
                    scale: h ? 1.04 : 1,
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.easeOutCubic,
                    child: _art(p.cover, 48),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            tx(p.title, 20, w: w800, f: F.semi, c: fg),
                            const SizedBox(height: 6),
                            tx(
                              p.meta,
                              12,
                              w: w600,
                              c: fg.withValues(alpha: 0.7),
                            ),
                          ],
                        ),
                      ),
                      Tap(
                        tip: context.l10n.actionPlay,
                        onTap: onPlay,
                        builder: (_, hh, pp) => PressScale(
                          pressed: pp,
                          hover: hh,
                          up: 1.1,
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: pal.darkText ? darkInk : white,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Ico(
                              'play',
                              size: 20,
                              color: pal.darkText ? white : darkInk,
                            ),
                          ),
                        ),
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
}

// ═════════════ Artists: bubbles ═════════════

class _ArtistsBody extends StatelessWidget {
  const _ArtistsBody();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lib = app.library!;
    final empty = _emptyState(
      context,
      app,
      'artists',
      lib.artists.length,
      context.l10n.libraryNoArtists,
    );
    if (empty != null) return empty;
    return _ArtistCloud(artists: lib.artists);
  }
}

/// Bubbles of real artists: those with more songs are larger and nearer the center, spiralling outward; scrolls vertically.
class _ArtistCloud extends StatelessWidget {
  const _ArtistCloud({required this.artists});
  final List<LibraryArtist> artists;

  // Bubble diameter 96–184 in the design
  static const minD = 96.0, maxD = 184.0, label = 28.0, gap = 18.0;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return LayoutBuilder(
      builder: (context, box) {
        final width = box.maxWidth - 80;
        final (placed, height) = _cloud(artists, width);
        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(40, 16, 40, 120),
          child: SizedBox(
            width: width,
            height: height,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                for (final (i, (a, c, d)) in placed.indexed)
                  Positioned(
                    left: c.dx - d / 2 - 40,
                    top: c.dy - d / 2,
                    width: d + 80,
                    child: FadeIn(
                      delay: math.min(i, 30) * 35,
                      dy: 0,
                      child: _BubbleView(
                        bubble: Bubble(a.name, a.cover, d),
                        route: a.route,
                        selected: a.name == app.track.artist,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

final _clouds =
    Expando<(double, List<(LibraryArtist, Offset, double)>, double)>();

/// Bubble layout: from the center along a spiral, each bubble goes in the first spot that doesn't overlap existing bubbles
/// (names included); only width-constrained, height grows with the count. Cached by list and width.
(List<(LibraryArtist, Offset, double)>, double) _cloud(
  List<LibraryArtist> artists,
  double width,
) {
  final hit = _clouds[artists];
  if (hit != null && hit.$1 == width) return (hit.$2, hit.$3);
  const minD = _ArtistCloud.minD, maxD = _ArtistCloud.maxD;
  const gap = _ArtistCloud.gap, label = _ArtistCloud.label;
  final top = artists.isEmpty ? 1 : math.max(1, artists.first.weight);
  final cx = width / 2;
  final out = <(LibraryArtist, Offset, double)>[];
  for (final a in artists) {
    final d = (minD + (maxD - minD) * math.sqrt(a.weight / top))
        .clamp(minD, maxD)
        .roundToDouble();
    final r = d / 2;
    var p = const Offset(0, 0);
    // Each step moves about 8 pixels along the spiral
    for (var ang = 0.0, rad = 0.0; rad < 100000; ang += 8 / math.max(rad, 8)) {
      rad = 4.0 * ang;
      p = Offset(cx + rad * math.cos(ang), rad * 0.6 * math.sin(ang));
      if (p.dx - r < 0 || p.dx + r > width) continue;
      final free = out.every((q) {
        final need = r + q.$3 / 2 + gap;
        final dx = p.dx - q.$2.dx;
        // The bubble below must also leave room for the name of the one above
        final dy = (p.dy - q.$2.dy).abs() * need / (need + label);
        return dx * dx + dy * dy >= need * need;
      });
      if (free) break;
    }
    out.add((a, p, d));
  }
  var lo = double.infinity, hi = 0.0;
  for (final (_, c, d) in out) {
    lo = math.min(lo, c.dy - d / 2);
    hi = math.max(hi, c.dy + d / 2 + label);
  }
  final shifted = [for (final (a, c, d) in out) (a, c.translate(0, -lo), d)];
  final height = out.isEmpty ? 0.0 : hi - lo;
  _clouds[artists] = (width, shifted, height);
  return (shifted, height);
}

/// The cover; a background with a music note when there's no cover.
Widget _art(String cover, double icon) => cover.isEmpty
    ? ColoredBox(
        color: P.dark ? wa(0.08) : ba(0.06),
        child: Center(
          child: Ico('music', size: icon, color: P.faint),
        ),
      )
    : Image(
        image: coverImage(cover),
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _art('', icon),
      );

class _BubbleView extends StatelessWidget {
  const _BubbleView({
    required this.bubble,
    required this.selected,
    required this.route,
  });
  final Bubble bubble;
  final bool selected;

  /// Artist page; not tappable when empty.
  final String route;

  @override
  Widget build(BuildContext context) {
    final b = bubble;
    return Tap(
      onTap: route.isEmpty ? null : () => context.appRead.go(route),
      builder: (_, h, p) => PressScale(
        pressed: p,
        hover: h,
        up: 1.06,
        down: 0.96,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: medium,
              width: b.d,
              height: b.d,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: selected ? Border.all(color: accent, width: 3) : null,
                boxShadow: [
                  BoxShadow(
                    color: ba(h ? 0.5 : 0),
                    blurRadius: 30,
                    offset: const Offset(0, 14),
                    spreadRadius: -6,
                  ),
                ],
              ),
              child: ClipOval(child: _art(b.cover, b.d / 3)),
            ),
            const SizedBox(height: 6),
            tx(
              b.name,
              b.d >= 140 ? 15 : 13,
              w: w700,
              f: F.semi,
              c: selected ? accent : P.ink,
            ),
          ],
        ),
      ),
    );
  }
}
