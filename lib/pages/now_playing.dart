import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/physics.dart';
import 'package:flutter/scheduler.dart' show Ticker;
import 'package:flutter/widgets.dart';

import '../cover_color.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../shell.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'comments.dart';
import 'links.dart';

class NowPlayingPage extends StatelessWidget {
  const NowPlayingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = app.track;
    final mv = t.mv;
    final noLyrics = !app.hasLyrics && !app.lyricsLoading && !mv;

    // When the source can't give similar songs (e.g. local music) this tab doesn't exist; stay on the queue
    var tab = app.npTab;
    if (tab == NpTab.similar && !app.canSimilar) tab = NpTab.queue;
    if (tab == NpTab.comments && !app.canComments) tab = NpTab.queue;
    if (mv && tab == NpTab.lyrics) tab = NpTab.queue;
    final big = tab == NpTab.lyrics && noLyrics;

    // Only switch the content below; the song info above isn't part of the switch, so two copies don't overlap and flicker
    final Widget body;
    if (big) {
      body = _BigInfo(key: ValueKey('big-${t.key}'), track: t);
    } else if (tab == NpTab.lyrics) {
      body = const Padding(
        key: ValueKey('lyrics'),
        padding: EdgeInsets.only(top: 232),
        child: _Lyrics(),
      );
    } else if (tab == NpTab.comments) {
      body = Padding(
        key: ValueKey('comments-${t.key}'),
        padding: const EdgeInsets.only(top: 228),
        child: CommentsPanel(track: t),
      );
    } else if (tab == NpTab.similar) {
      final list = app.similarTo(t);
      body = Padding(
        key: const ValueKey('similar'),
        padding: const EdgeInsets.only(top: 228),
        child: _NpList(
          label: context.l10n.npSimilarTo(t.title),
          items: list ?? const [],
          empty: list == null
              ? context.l10n.stateLoading
              : context.l10n.npNoSimilar,
          showDur: true,
          onTap: (i) => app.playTrack(list![i]),
        ),
      );
    } else {
      body = Padding(
        key: const ValueKey('queue'),
        padding: const EdgeInsets.only(top: 228),
        child: _NpList(
          label: context.l10n.npUpNext,
          items: app.upNext,
          empty: context.l10n.npQueueEmpty,
          showDur: !mv,
          onTap: (i) => app.playQueueAt(app.index + 1 + i),
        ),
      );
    }
    final left = Stack(
      fit: StackFit.expand,
      children: [
        AnimatedOpacity(
          opacity: big ? 0 : 1,
          duration: const Duration(milliseconds: 200),
          child: IgnorePointer(
            ignoring: big,
            child: Stack(children: [_TrackInfo(track: t)]),
          ),
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 260),
          // Fade the old out before fading the new in, so the two never overlap semi-transparently
          switchInCurve: const Interval(0.4, 1, curve: Curves.easeOutCubic),
          switchOutCurve: const Interval(0.4, 1, curve: Curves.easeInCubic),
          transitionBuilder: (c, a) => FadeTransition(opacity: a, child: c),
          layoutBuilder: (cur, prev) =>
              Stack(fit: StackFit.expand, children: [...prev, ?cur]),
          child: body,
        ),
      ],
    );

    // The background always uses the current song cover's dominant color (CoverTone transitions smoothly on song change)
    return CoverTone(
      coverId: t.cover,
      // Same as Rewind's Library Stack background: straight RGB from the
      // color on screen, 1.2s, ease-in-ease-out (Curves.easeInOut is the
      // same cubic as CAMediaTimingFunction.easeInEaseOut)
      duration: const Duration(milliseconds: 1200),
      curve: Curves.easeInOut,
      builder: (context, pal) => ColoredBox(
        color: pal.deep,
        child: ClipRect(
          child: LayoutBuilder(
            builder: (context, box) => Stack(
              children: [
                // Tilted cover / MV on the right (scales with the window, stays out of the lyrics area on the left, vertically centered)
                _Art(
                  track: t,
                  playing: app.playing,
                  back: app.skippedBack,
                  stageSize: box.biggest,
                ),
                // The title bar area at the top can drag the window (beneath _TopBar so buttons stay clickable)
                const Positioned(
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 80,
                  child: DragWindow(),
                ),
                Positioned(
                  left: 40,
                  top: 0,
                  bottom: 110,
                  width: 780,
                  child: left,
                ),
                const _TopBar(),
                const Positioned(
                  left: 40,
                  right: 40,
                  bottom: 32,
                  height: 240,
                  child: TipScope(child: _BottomBar()),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Art extends StatelessWidget {
  const _Art({
    required this.track,
    required this.playing,
    required this.back,
    required this.stageSize,
  });
  final Track track;
  final bool playing;

  /// The song was reached with "previous", so the cover change runs reversed.
  final bool back;
  final Size stageSize;

  // Right edge of the left content area (left: 40, width: 780) + safety margin, so the 6° rotation doesn't cover the lyrics.
  static const _leftLimit = 856.0;
  static const _topSafe = 80.0;
  static const _bottomSafe = 110.0;
  static const _tiltRad = 6 * math.pi / 180;

  @override
  Widget build(BuildContext context) {
    final mv = track.mv;
    final cos6 = math.cos(_tiltRad);
    final sin6 = math.sin(_tiltRad);
    final availW = math.max(160.0, stageSize.width - _leftLimit);
    final availH = math.max(200.0, stageSize.height - _topSafe - _bottomSafe);
    final centerY = _topSafe + availH / 2;

    final double artW, artH, right;
    if (mv) {
      const bleedRatio = 60.0 / 720.0;
      const ratio = 16.0 / 9.0;
      final maxByW = availW / (0.5 - bleedRatio + 0.5 * (cos6 + sin6 / ratio));
      final maxByH = availH * 0.83 * ratio;
      artW = math.min(maxByW, maxByH).clamp(240.0, 1400.0);
      artH = artW / ratio;
      right = -(artW * bleedRatio);
    } else {
      const bleedRatio = 40.0 / 580.0;
      final maxByW = availW / (0.5 - bleedRatio + 0.5 * (cos6 + sin6));
      final maxByH = availH * 0.83;
      artW = math.min(maxByW, maxByH).clamp(200.0, 1200.0);
      artH = artW;
      right = -(artW * bleedRatio);
    }
    final top = centerY - artH / 2;
    final radius = (artH * (28.0 / 580.0)).clamp(20.0, 44.0);

    final Widget art = mv
        ? Tap(
            key: ValueKey('mv-${track.key}'),
            onDoubleTap: context.appRead.togglePlay,
            onMenu: (p) => showMenu(context, p, trackMenu(context, track)),
            builder: (_, h, _) => Container(
              width: artW,
              height: artH,
              decoration: ShapeDecoration(
                shape: RoundedSuperellipseBorder(
                  borderRadius: BorderRadius.circular(radius),
                ),
                shadows: [
                  BoxShadow(
                    color: ba(0.5),
                    blurRadius: 60,
                    offset: const Offset(0, 30),
                    spreadRadius: -10,
                  ),
                ],
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Cover(track.cover, w: artW, h: artH, r: radius),
                  IgnorePointer(
                    ignoring: !(h || !playing),
                    child: AnimatedOpacity(
                      duration: medium,
                      opacity: h || !playing ? 1 : 0,
                      child: Center(
                        child: Tap(
                          tip: playing
                              ? context.l10n.actionPause
                              : context.l10n.actionPlay,
                          tipOnCover: true,
                          onTap: context.appRead.togglePlay,
                          builder: (_, hh, p) => PressScale(
                            pressed: p,
                            hover: hh,
                            up: 1.06,
                            child: Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                color: ba(0.35),
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Ico(
                                playing ? 'pause' : 'play',
                                size: 30,
                                color: white,
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
          )
        : Tap(
            key: ValueKey('cover-${track.cover}'),
            cursor: MouseCursor.defer,
            onMenu: (p) => showMenu(context, p, trackMenu(context, track)),
            builder: (_, _, _) => Container(
              width: artW,
              height: artH,
              decoration: ShapeDecoration(
                shape: RoundedSuperellipseBorder(
                  borderRadius: BorderRadius.circular(radius),
                ),
                shadows: [
                  BoxShadow(
                    color: ba(0.5),
                    blurRadius: 60,
                    offset: const Offset(0, 30),
                    spreadRadius: -10,
                  ),
                ],
              ),
              child: Cover(track.cover, w: artW, h: artH, r: radius),
            ),
          );

    return Positioned(
      top: top,
      right: right,
      child: AnimatedScale(
        // The cover recedes slightly when paused
        scale: playing ? 1 : 0.94,
        duration: const Duration(milliseconds: 700),
        curve: const SpringCurve(bounce: 0.15),
        child: _deckSwitcher(art, artW, back),
      ),
    );
  }

  /// Card deck. "Next" pulls the old cover off the top of the pile towards
  /// the bottom right, revealing the new one, which springs up from
  /// underneath. "Previous" is the reverse: the earlier cover flies back from
  /// the bottom right onto the pile, and the current one sinks away beneath
  /// it. Either way the two only overlap briefly, never side by side.
  static Widget _deckSwitcher(Widget art, double artW, bool back) {
    // Where a pulled-off cover rests: down and to the right, tilted further.
    final away = Offset(artW * 0.35, artW * 0.7);
    const awayTurn = 14 * math.pi / 180;

    Widget pulled(Widget? c, double p) => Opacity(
      opacity: 1 - ((p - 0.3) / 0.6).clamp(0.0, 1.0),
      child: Transform.translate(
        offset: away * p,
        child: Transform.rotate(angle: _tiltRad + awayTurn * p, child: c),
      ),
    );

    Widget underneath(Widget? c, double t, double opacity) => Opacity(
      opacity: opacity,
      child: Transform.rotate(
        angle: _tiltRad,
        child: Transform.scale(scale: 0.88 + 0.12 * t, child: c),
      ),
    );

    return AnimatedSwitcher(
      duration: Duration(milliseconds: back ? 600 : 760),
      reverseDuration: Duration(milliseconds: back ? 600 : 400),
      // Curves are applied in the builder so each direction gets its own timing.
      transitionBuilder: (c, a) => AnimatedBuilder(
        animation: a,
        child: c,
        builder: (_, cc) {
          // Outgoing children run their controller in reverse (1 → 0).
          final out = a.status == AnimationStatus.reverse;
          final v = out ? 1 - a.value : a.value;
          if (!back) {
            if (out) return pulled(cc, Curves.easeInOutCubic.transform(v));
            // Waits ~300ms until the outgoing cover is nearly gone, so the
            // two never visibly stack, then springs up from 0.88.
            final w = ((v - 0.4) / 0.6).clamp(0.0, 1.0);
            return underneath(
              cc,
              const SpringCurve(bounce: 0.12).transform(w),
              Curves.easeOut.transform((w / 0.35).clamp(0.0, 1.0)),
            );
          }
          if (out) {
            // Starts sinking to 0.88 and fading soon after the returning
            // cover sets off (~60ms) and is gone by ~360ms.
            final w = Curves.easeIn.transform(
              ((v - 0.1) / 0.5).clamp(0.0, 1.0),
            );
            return underneath(cc, 1 - w, 1 - w);
          }
          // Lands on the pile: fast, then easing to a stop. Given 520ms
          // (vs. 400ms for "next") because an ease-out covers most of its
          // distance early and would otherwise feel much quicker.
          final f = (v / (520 / 600)).clamp(0.0, 1.0);
          final t = Curves.easeOutCubic.transform(f);
          return Opacity(
            opacity: Curves.easeOut.transform((f / 0.25).clamp(0.0, 1.0)),
            child: Transform.translate(
              offset: away * (1 - t),
              child: Transform.rotate(
                angle: _tiltRad + awayTurn * (1 - t),
                child: cc,
              ),
            ),
          );
        },
      ),
      // The cover being pulled off, or the one flying back, is on top.
      layoutBuilder: (cur, prev) => Stack(
        alignment: Alignment.centerRight,
        children: back ? [...prev, ?cur] : [?cur, ...prev],
      ),
      child: art,
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = app.track;
    // The tab group is centered; collapse sits at the end of the bottom player bar (final v32), no buttons top left or top right
    return Positioned(
      left: 0,
      right: 0,
      top: 32,
      child: Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CoverPill(
              label: context.l10n.npTitle,
              active: app.npTab == NpTab.lyrics && !t.mv,
              enabled: !t.mv,
              onTap: () => app.setNpTab(NpTab.lyrics),
            ),
            if (app.canComments) ...[
              const SizedBox(width: 8),
              CoverPill(
                label: context.l10n.npComments,
                active: app.npTab == NpTab.comments,
                onTap: () => app.setNpTab(NpTab.comments),
              ),
            ],
            const SizedBox(width: 8),
            CoverPill(
              label: context.l10n.miniQueue,
              active:
                  t.mv ||
                  app.npTab == NpTab.queue ||
                  (app.npTab == NpTab.similar && !app.canSimilar) ||
                  (app.npTab == NpTab.comments && !app.canComments),
              onTap: () => app.setNpTab(NpTab.queue),
            ),
            if (app.canSimilar) ...[
              const SizedBox(width: 8),
              CoverPill(
                label: context.l10n.npSimilar,
                active: app.npTab == NpTab.similar && !t.mv,
                onTap: () => app.setNpTab(NpTab.similar),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// "From …": where the queue came from. When unknown the caller omits this line (the top tab already says "Now Playing").
/// When it came from an album or playlist, the name can be tapped.
class _FromLink extends StatelessWidget {
  const _FromLink({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final name = app.queueName;
    final style = ts(size, w: w700, f: F.semi, c: wa(0.6));
    if (name.isEmpty) return const SizedBox.shrink();
    return _Link(
      name,
      prefix: context.l10n.npFromPrefix,
      route: app.queueFromRoute,
      style: style,
    );
  }
}

/// Tappable text on the Now Playing page: white 100% + underline on hover; tapping collapses Now Playing and opens [route].
/// Plain text when [route] is empty. [prefix] isn't tappable.
class _Link extends StatelessWidget {
  const _Link(
    this.text, {
    required this.route,
    required this.style,
    this.prefix = '',
    this.lines = 1,
  });
  final String text, prefix;
  final String? route;
  final TextStyle style;
  final int lines;

  @override
  Widget build(BuildContext context) {
    final r = route;
    Widget line(bool h) => CjkText.rich(
      TextSpan(
        children: [
          if (prefix.isNotEmpty) TextSpan(text: prefix),
          TextSpan(
            text: text,
            style: h
                ? const TextStyle(
                    color: white,
                    decoration: TextDecoration.underline,
                    decorationColor: white,
                  )
                : null,
          ),
        ],
      ),
      style: style,
      maxLines: lines,
      overflow: TextOverflow.ellipsis,
    );
    if (r == null) return line(false);
    return Tap(
      onTap: () => context.appRead.open(r),
      builder: (_, h, _) => line(h),
    );
  }
}

class _TrackInfo extends StatelessWidget {
  const _TrackInfo({required this.track});
  final Track track;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Positioned(
      left: 0,
      top: 108,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (app.queueName.isNotEmpty) ...[
            _FromLink(size: 13),
            const SizedBox(height: 4),
          ],
          _Link(
            track.title,
            route: app.albumRouteOf(track),
            style: ts(22, w: w900, f: F.wide, c: white),
          ),
          const SizedBox(height: 6),
          LinkText(
            [
              ...joinLinks([artistLinks(app, track)]),
            ],
            hover: white,
            style: ts(13, w: w600, c: wa(0.65)),
          ),
          const SizedBox(height: 22),
          Container(
            width: 48,
            height: 3,
            decoration: squircle(2, color: wa(0.35)),
          ),
        ],
      ),
    );
  }
}

/// Large song info shown when there are no lyrics.
class _BigInfo extends StatelessWidget {
  const _BigInfo({super.key, required this.track});
  final Track track;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: const Alignment(-1, -0.02),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (context.app.queueName.isNotEmpty) ...[
            const FadeIn(child: _FromLink(size: 18)),
            const SizedBox(height: 6),
          ],
          FadeIn(
            delay: 60,
            child: _Link(
              track.title,
              route: context.app.albumRouteOf(track),
              style: ts(80, w: w900, f: F.wide, c: white, h: 1.05),
              lines: 2,
            ),
          ),
          const SizedBox(height: 14),
          FadeIn(
            delay: 120,
            child: LinkText(
              joinLinks([artistLinks(context.app, track)]),
              hover: white,
              style: ts(24, w: w700, f: F.semi, c: wa(0.75)),
            ),
          ),
        ],
      ),
    );
  }
}

// ───────────── Lyrics ─────────────

/// Lyric line height cache (keyed by font size, weight, font and text). Cleared entirely over the limit so it can't grow forever.
final _heights = _BoundedCache<String, double>(2000);

class _BoundedCache<K, V> {
  _BoundedCache(this.max);
  final int max;
  final _m = <K, V>{};

  V putIfAbsent(K k, V Function() f) {
    final hit = _m[k];
    if (hit != null) return hit;
    if (_m.length >= max) _m.clear();
    return _m[k] = f();
  }
}

/// The current line is largest, fading above and below; on line change the column slides up smoothly and the font size follows.
class _Lyrics extends StatefulWidget {
  const _Lyrics();

  @override
  State<_Lyrics> createState() => _LyricsState();
}

class _LyricsState extends State<_Lyrics> with SingleTickerProviderStateMixin {
  /// Scrolling with the wheel / trackpad enters "browsing": every line is small, the layout doesn't depend on the current line,
  /// and the position [_abs] follows only gestures; the line being sung keeps advancing, distinguished only by highlight.
  /// After 3 seconds without input it returns to following, and the current line grows again.
  bool _scrolling = false;
  double _abs = 0;
  Timer? _back;

  /// When browsing started: for the first 520ms the current line is shrinking, and line positions follow with the same duration so they don't overlap.
  DateTime _since = DateTime(0);
  bool get _settling =>
      DateTime.now().difference(_since) < const Duration(milliseconds: 520);

  /// The last input was a mouse wheel: one notch jumps far, so the position tweens over 90ms; trackpad and momentum follow directly.
  bool _wheel = false;

  // Trackpad momentum after release: decelerate with friction from the velocity before release.
  late final Ticker _fling = createTicker(_onFling);
  FrictionSimulation? _sim;
  double _vel = 0; // px/s, smoothed from the last few moves
  DateTime _lastMove = DateTime(0);
  double _min = 0, _max = 0;

  @override
  void dispose() {
    _back?.cancel();
    _fling.dispose();
    super.dispose();
  }

  void _onFling(Duration t) {
    final sim = _sim;
    if (sim == null || !mounted) return;
    final s = t.inMicroseconds / 1e6;
    final x = sim.x(s).clamp(_min, _max).toDouble();
    final done = sim.isDone(s) || x == _min || x == _max;
    setState(() => _abs = x);
    _back?.cancel();
    _back = Timer(const Duration(seconds: 3), _resume);
    if (done) _stopFling();
  }

  void _stopFling() {
    _sim = null;
    if (_fling.isActive) _fling.stop();
  }

  /// One trackpad move: record the velocity for use on release.
  void _pan(double dy, void Function(double) scroll) {
    _stopFling();
    final now = DateTime.now();
    final dt = now.difference(_lastMove).inMicroseconds / 1e6;
    _lastMove = now;
    final v = dt > 0 && dt < 0.1 ? dy / dt : 0.0;
    _vel = _vel * 0.4 + v * 0.6;
    _wheel = false;
    scroll(dy);
  }

  void _panEnd() {
    // Pausing for a moment before releasing doesn't count as a fling
    final idle = DateTime.now().difference(_lastMove).inMilliseconds > 80;
    if (!_scrolling || idle || _vel.abs() < 80) return;
    // Decelerate a bit faster; stop below 20px/s so the tail doesn't drag on
    _sim = FrictionSimulation(
      0.03,
      _abs,
      _vel,
      tolerance: const Tolerance(velocity: 20, distance: 0.5),
    );
    _vel = 0;
    _fling.start();
  }

  void _scrollBy(double dy, double from, double min, double max) {
    _back?.cancel();
    _min = min;
    _max = max;
    setState(() {
      if (!_scrolling) {
        _abs = from;
        _since = DateTime.now();
      }
      _scrolling = true;
      _abs = (_abs + dy).clamp(min, max).toDouble();
    });
    _back = Timer(const Duration(seconds: 3), _resume);
  }

  void _resume() {
    _back?.cancel();
    _stopFling();
    if (mounted) setState(() => _scrolling = false);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final mode = app.lyricMode;
    return ValueListenableBuilder<double>(
      valueListenable: app.pos,
      builder: (context, _, _) {
        final ls = app.lyricLines;
        if (ls.isEmpty) return const SizedBox.shrink();
        final playing = app.lyricIndex;
        return LayoutBuilder(
          builder: (context, box) {
            const maxW = 760.0;
            // Every line is laid out at the current line's font, so line breaks are fixed; other lines are just scaled down
            // (scaling doesn't re-layout), so lines don't jump when switching.
            const big = 40.0, subBig = 18.0;
            const small = 0.55; // other lines' lyrics scale to 55% (about 22pt)
            // Translations scale separately; other lines' translations are about 14pt
            const subSmall = 0.8;

            String main(int i) =>
                mode == LyricMode.trans && ls[i].trans.isNotEmpty
                ? ls[i].trans
                : ls[i].text;
            String? sub(int i) =>
                mode == LyricMode.both && ls[i].trans.isNotEmpty
                ? ls[i].trans
                : null;

            // Layout runs on every progress update; line heights are cached by content and font size and computed once.
            double measure(
              String s,
              double size,
              FontWeight w,
              F f,
              double h,
            ) => _heights.putIfAbsent('$size|${w.value}|$f|$h|$s', () {
              final tp = TextPainter(
                text: cjkSpan(s, ts(size, w: w, f: f, h: h)),
                textDirection: TextDirection.ltr,
              )..layout(maxWidth: maxW);
              final height = tp.height;
              tp.dispose();
              return height;
            });

            double mainH(int i) => measure(main(i), big, w900, F.wide, 1.1);
            // [big] is the enlarged line; -1 means none is enlarged (while browsing)
            double heightOf(int i, int bigRow) {
              final c = i == bigRow;
              final h = mainH(i) * (c ? 1 : small);
              final s = sub(i);
              if (s == null) return h;
              return h +
                  8 +
                  measure(s, subBig, w700, F.body, 1.3) * (c ? 1 : subSmall);
            }

            const gap = 34.0;
            List<double> topsFor(int bigRow) {
              final out = <double>[];
              var y = 0.0;
              for (var i = 0; i < ls.length; i++) {
                out.add(y);
                y += heightOf(i, bigRow) + gap;
              }
              return out;
            }

            final followTops = topsFor(playing);
            final browseTops = topsFor(-1);
            final tops = _scrolling ? browseTops : followTops;
            final anchorRow = playing >= 0 ? playing : 0;
            // The current line sits at about 30% of the area's height
            final anchor = box.maxHeight * 0.30;
            final follow = followTops[anchorRow] - anchor;
            // Scroll up at most until the first line shows below the top gradient, down at most until the last line rests at the anchor
            final minOff = -(box.maxHeight * 0.08 + 24);
            final maxOff = math.max(minOff, browseTops.last - anchor);
            final offset = _scrolling ? _abs : follow;
            // When scrolling starts the current line shrinks but stays in place, and the lines below move up
            void scroll(double dy) =>
                _scrollBy(dy, browseTops[anchorRow] - anchor, minOff, maxOff);

            return Listener(
              onPointerSignal: (e) {
                // One mouse wheel notch is too small, so scale it up; the trackpad goes through panZoom below and follows the finger unscaled
                if (e is PointerScrollEvent) {
                  _stopFling();
                  _wheel = true;
                  scroll(e.scrollDelta.dy * 2.5);
                }
              },
              // Trackpad: finger movement doubled, with momentum after release
              onPointerPanZoomUpdate: (e) => _pan(-e.panDelta.dy * 2, scroll),
              onPointerPanZoomEnd: (_) => _panEnd(),
              child: ShaderMask(
                blendMode: BlendMode.dstIn,
                shaderCallback: (r) => LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [ba(0), black, black, ba(0)],
                  stops: const [0, 0.08, 0.86, 1],
                ).createShader(r),
                child: ClipRect(
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // The whole block catches scrolling, so the gaps between lines scroll too
                      const Positioned.fill(
                        child: ColoredBox(color: Color(0x00000000)),
                      ),
                      for (var i = 0; i < ls.length; i++)
                        AnimatedPositioned(
                          key: ValueKey(i),
                          // Follow the finger when scrolling manually, use a spring when following automatically
                          duration: Duration(
                            milliseconds: !_scrolling
                                ? 700
                                : (_settling ? 520 : (_wheel ? 90 : 0)),
                          ),
                          curve: !_scrolling
                              ? const SpringCurve(bounce: 0.08)
                              : (_settling
                                    ? Curves.easeOutCubic
                                    : Curves.linear),
                          left: 0,
                          width: maxW,
                          top: tops[i] - offset,
                          child: _LyricRow(
                            main: main(i),
                            sub: sub(i),
                            distance: (i - playing).abs(),
                            current: i == playing && !_scrolling,
                            browsing: _scrolling,
                            size: big,
                            subSize: subBig,
                            small: small,
                            subSmall: subSmall,
                            mainHeight: mainH(i),
                            onTap: () {
                              _resume();
                              app.seekLyric(i);
                            },
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _LyricRow extends StatelessWidget {
  const _LyricRow({
    required this.main,
    required this.sub,
    required this.distance,
    required this.current,
    required this.browsing,
    required this.size,
    required this.subSize,
    required this.small,
    required this.subSmall,
    required this.mainHeight,
    required this.onTap,
  });

  final String main;
  final String? sub;
  final int distance;

  /// [current]: the enlarged current line. [browsing]: the user is scrolling; the line being sung (distance 0)
  /// is fully bright and other lines uniformly semi-transparent, so they stay readable when scrolled far.
  final bool current, browsing;

  /// Font size of the current line; other lines use the same layout, with lyrics scaled to [small] and translations to [subSmall].
  final double size, subSize, small, subSmall;

  /// Height of the lyrics laid out at [size], used to put the translation right below the scaled-down lyrics.
  final double mainHeight;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final base = browsing
        ? (distance == 0 ? 1.0 : 0.45)
        : switch (distance) {
            0 => 1.0,
            1 => 0.5,
            2 => 0.3,
            _ => 0.18,
          };
    return Tap(
      onTap: onTap,
      builder: (_, h, _) => AnimatedOpacity(
        duration: const Duration(milliseconds: 260),
        opacity: h && distance != 0 ? math.max(base, 0.75) : base,
        child: TweenAnimationBuilder<double>(
          // 0 = other lines, 1 = current line
          tween: Tween(end: current ? 1 : 0),
          duration: const Duration(milliseconds: 520),
          curve: Curves.easeOutCubic,
          builder: (_, k, _) {
            // Scale only the painting, not the layout: line breaks always match the current line
            final km = small + (1 - small) * k;
            final ks = subSmall + (1 - subSmall) * k;
            final lyric = Transform.scale(
              scale: km,
              alignment: Alignment.topLeft,
              child: CjkText(
                main,
                style: ts(size, w: w900, f: F.wide, c: white, h: 1.1),
              ),
            );
            final s = sub;
            if (s == null) return lyric;
            return Stack(
              clipBehavior: Clip.none,
              children: [
                lyric,
                Positioned(
                  left: 0,
                  right: 0,
                  top: mainHeight * km + 8,
                  child: Transform.scale(
                    scale: ks,
                    alignment: Alignment.topLeft,
                    child: CjkText(
                      s,
                      style: ts(subSize, w: w700, c: wa(0.85), h: 1.3),
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
}

// ───────────── Queue / Similar songs ─────────────

class _NpList extends StatelessWidget {
  const _NpList({
    required this.label,
    required this.items,
    required this.empty,
    required this.showDur,
    required this.onTap,
  });
  final String label, empty;
  final List<Track> items;
  final bool showDur;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        tx(label, 13, w: w700, f: F.semi, c: wa(0.6)),
        const SizedBox(height: 14),
        Expanded(
          child: items.isEmpty
              ? Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: tx(empty, 15, w: w600, c: wa(0.5)),
                )
              // Shift the whole list left by 10 so the left edge of the hover background aligns with the title;
              // the list itself moves, so the clip boundary moves with it and the background isn't cut off
              : Transform.translate(
                  offset: const Offset(-10, 0),
                  child: ShaderMask(
                    blendMode: BlendMode.dstIn,
                    shaderCallback: (r) => LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [black, black, ba(0)],
                      stops: const [0, 0.85, 1],
                    ).createShader(r),
                    // No scrollbar on the Now Playing page
                    child: ScrollConfiguration(
                      behavior: const NoBars(),
                      child: ListView.builder(
                        padding: const EdgeInsets.only(bottom: 40),
                        itemCount: items.length,
                        itemBuilder: (context, i) => FadeIn(
                          delay: math.min(i, 8) * 30,
                          child: _NpRow(
                            track: items[i],
                            wide: items.any((t) => t.mv),
                            showDur: showDur,
                            onTap: () => onTap(i),
                          ),
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

class _NpRow extends StatelessWidget {
  const _NpRow({
    required this.track,
    required this.wide,
    required this.showDur,
    required this.onTap,
  });
  final Track track;

  /// With MVs in the list the cover slot is 80 wide at 16:9, otherwise a 45 square cover, left-aligned with the title.
  final bool wide;
  final bool showDur;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = track;
    return Tap(
      onDoubleTap: onTap,
      onMenu: (p) => showMenu(context, p, trackMenu(context, t)),
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        // 10 on every side of the cover: 45 + 10 × 2
        height: 65,
        width: 792,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(14, color: h ? ba(0.16) : ba(0)),
        child: Row(
          children: [
            // The play button sits on the cover: at the start of the row like other lists, with the duration shown as usual
            Stack(
              alignment: Alignment.centerLeft,
              children: [
                SizedBox(
                  width: wide ? 80 : 45,
                  height: 45,
                  child: t.mv
                      ? Stack(
                          children: [
                            Cover(t.cover, w: 80, h: 45, r: 8),
                            Positioned(
                              left: 4,
                              top: 4,
                              child: Container(
                                width: 22,
                                height: 12,
                                alignment: Alignment.center,
                                decoration: squircle(3, color: ba(0.7)),
                                child: tx('MV', 8, w: w800, c: white),
                              ),
                            ),
                          ],
                        )
                      : Align(
                          alignment: Alignment.centerLeft,
                          child: Cover(t.cover, w: 45, h: 45, r: 8),
                        ),
                ),
                Positioned.fill(
                  child: IgnorePointer(
                    ignoring: !h,
                    child: AnimatedOpacity(
                      duration: fast,
                      opacity: h ? 1 : 0,
                      child: Tap(
                        tip: context.l10n.actionPlay,
                        tipOnCover: true,
                        onTap: onTap,
                        builder: (_, _, _) => Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            width: t.mv ? 80 : 45,
                            height: 45,
                            decoration: squircle(8, color: ba(0.4)),
                            alignment: Alignment.center,
                            child: const Ico('play', size: 20, color: white),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(t.title, 15, w: w700, c: white),
                  const SizedBox(height: 5),
                  LinkText(
                    [
                      ...joinLinks([artistLinks(context.app, t)]),
                    ],
                    hover: white,
                    style: ts(12, w: w600, c: wa(0.6)),
                  ),
                ],
              ),
            ),
            if (showDur) tx(t.dur, 13, w: w600, c: wa(0.55), tnum: true),
          ],
        ),
      ),
    );
  }
}

// ───────────── Bottom player bar (on cover color) ─────────────

class _BottomBar extends StatelessWidget {
  const _BottomBar();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Collapse at the far left (final v33)
        _CoverSeg(
          icon: 'chevron-down',
          tip: context.l10n.actionCollapse,
          color: white,
          onTap: app.closeNowPlaying,
        ),
        const SizedBox(width: 8),
        const Expanded(child: _Progress()),
        const SizedBox(width: 8),
        _CoverSeg(
          icon: 'shuffle',
          tip: context.l10n.actionShuffle,
          color: app.shuffle ? accent : white,
          dot: app.shuffle,
          onTap: app.toggleShuffle,
        ),
        const SizedBox(width: 8),
        const _WhiteControls(),
        const SizedBox(width: 8),
        _CoverSeg(
          icon: app.repeatMode == PlaybackRepeatMode.one
              ? 'repeat-one'
              : 'repeat',
          tip: switch (app.repeatMode) {
            PlaybackRepeatMode.off => context.l10n.miniRepeatOff,
            PlaybackRepeatMode.all => context.l10n.miniRepeatOn,
            PlaybackRepeatMode.one => context.l10n.miniRepeatOne,
          },
          color: app.repeatMode == PlaybackRepeatMode.off ? wa(0.5) : white,
          dot: app.repeatMode != PlaybackRepeatMode.off,
          onTap: app.toggleRepeat,
        ),
        const SizedBox(width: 8),
        _CoverSeg(
          icon: app.isLiked ? 'heart-filled' : 'heart',
          tip: app.isLiked
              ? context.l10n.actionUnlike
              : context.l10n.actionLike,
          color: app.isLiked ? heart : white,
          onTap: app.toggleLike,
          pop: app.isLiked,
        ),
        const SizedBox(width: 8),
        VolumeSeg(
          width: 58,
          base: 72,
          radius: 24,
          bg: ba(0.22),
          fill: white,
          onCover: true,
        ),
        const SizedBox(width: 8),
        // More: sleep timer and so on; the menu opens upwards
        Builder(
          builder: (ctx) => _CoverSeg(
            icon: 'more',
            tip: context.l10n.actionMore,
            color: white,
            onTap: () {
              final box = ctx.findRenderObject() as RenderBox;
              showMenu(
                ctx,
                // No room on the right: align the menu's right edge with the button's
                box.localToGlobal(Offset(box.size.width + 2, -6)),
                npMoreMenu(ctx),
                above: true,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CoverSeg extends StatelessWidget {
  const _CoverSeg({
    required this.icon,
    required this.tip,
    required this.color,
    required this.onTap,
    this.dot = false,
    this.pop,
  });
  final String icon, tip;
  final Color color;
  final bool dot;
  final bool? pop;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    Widget ico = Ico(icon, size: 24, color: color);
    if (pop != null) {
      ico = TweenAnimationBuilder<double>(
        key: ValueKey(pop),
        tween: Tween(begin: pop! ? 1.4 : 0.8, end: 1),
        duration: const Duration(milliseconds: 420),
        curve: bouncy,
        builder: (_, s, c) => Transform.scale(scale: s, child: c),
        child: ico,
      );
    }
    return Tap(
      tip: tip,
      tipOnCover: true,
      onTap: onTap,
      builder: (_, h, p) => AnimatedContainer(
        duration: fast,
        width: 58,
        height: 72,
        decoration: squircle(24, color: h ? ba(0.42) : ba(0.22)),
        child: Stack(
          alignment: Alignment.center,
          children: [
            PressScale(pressed: p, down: 0.86, child: ico),
            Positioned(
              top: 54,
              child: AnimatedScale(
                scale: dot ? 1 : 0,
                duration: const Duration(milliseconds: 260),
                curve: bouncy,
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WhiteControls extends StatelessWidget {
  const _WhiteControls();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    Widget b(
      String icon,
      String tip,
      double size,
      double w,
      VoidCallback onTap,
    ) => Tap(
      tip: tip,
      tipOnCover: true,
      onTap: onTap,
      // Sketch component NP Bar "Button Hover": 58×72, radius 24, #000 12%
      builder: (_, h, p) => AnimatedContainer(
        duration: fast,
        width: w,
        height: 72,
        alignment: Alignment.center,
        decoration: squircle(24, color: h ? ba(0.12) : ba(0)),
        child: PressScale(
          pressed: p,
          down: 0.86,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 180),
            transitionBuilder: (c, a) => ScaleTransition(
              scale: a,
              child: FadeTransition(opacity: a, child: c),
            ),
            child: Ico(icon, key: ValueKey(icon), size: size, color: darkInk),
          ),
        ),
      ),
    );
    return Container(
      width: 174,
      height: 72,
      clipBehavior: Clip.antiAlias,
      decoration: squircle(24, color: white),
      child: Row(
        children: [
          b('previous', context.l10n.actionPrev, 28, 58, app.prev),
          b(
            app.playing ? 'pause' : 'play',
            app.playing ? context.l10n.actionPause : context.l10n.actionPlay,
            36,
            58,
            app.togglePlay,
          ),
          b('next', context.l10n.actionNext, 28, 58, app.next),
        ],
      ),
    );
  }
}

class _Progress extends StatelessWidget {
  const _Progress();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return SizedBox(
      height: 72,
      child: LayoutBuilder(
        builder: (context, box) {
          final w = box.maxWidth;
          return ValueListenableBuilder<double>(
            valueListenable: app.pos,
            builder: (context, _, _) {
              final prog = app.progress;
              final duration = app.playbackDuration;
              Widget labels(Color c) => Stack(
                children: [
                  Positioned(
                    left: 25,
                    top: 0,
                    bottom: 0,
                    child: Center(
                      child: tx(
                        fmtTime(app.position),
                        14,
                        w: w700,
                        c: c,
                        tnum: true,
                      ),
                    ),
                  ),
                  Positioned(
                    right: 24,
                    top: 0,
                    bottom: 0,
                    child: Center(
                      child: tx(
                        fmtTime(duration),
                        14,
                        w: w700,
                        c: c,
                        tnum: true,
                      ),
                    ),
                  ),
                ],
              );
              return Scrubber(
                onChanged: app.scrub,
                onCommit: app.seek,
                builder: (_, at, dragging) => TipAnchor(
                  text: fmtTime((at ?? 0) * duration),
                  show: at != null && !dragging,
                  onCover: true,
                  dx: (at ?? 0) * w,
                  child: ClipRSuperellipse(
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      color: ba(0.22),
                      child: Stack(
                        children: [
                          Positioned(
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: w * prog,
                            child: Container(color: white),
                          ),
                          if (at != null && !dragging && at > prog)
                            Positioned(
                              left: w * prog,
                              top: 0,
                              bottom: 0,
                              width: w * (at - prog),
                              child: Container(color: wa(0.25)),
                            ),
                          if (dragging)
                            Positioned(
                              left: w * prog - 1,
                              top: 14,
                              bottom: 14,
                              width: 2,
                              child: Container(
                                decoration: squircle(1, color: accent),
                              ),
                            )
                          else if (at != null)
                            Positioned(
                              left: w * at - 1,
                              top: 0,
                              bottom: 0,
                              width: 2,
                              child: Container(color: white),
                            ),
                          // Time is drawn in two layers: white text underneath; black text is shown only where the white progress bar
                          // covers it. When the progress edge falls in the middle of a digit, the digit is half black, half white.
                          Positioned.fill(child: labels(white)),
                          Positioned(
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: w * prog,
                            child: ClipRect(
                              child: OverflowBox(
                                alignment: Alignment.centerLeft,
                                minWidth: w,
                                maxWidth: w,
                                child: labels(darkInk),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
