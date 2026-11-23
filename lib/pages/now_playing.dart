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

    // 源给不出相似歌曲（比如本地音乐）时没有这个标签，停在播放队列
    var tab = app.npTab;
    if (tab == NpTab.similar && !app.canSimilar) tab = NpTab.queue;
    if (tab == NpTab.comments && !app.canComments) tab = NpTab.queue;
    if (mv && tab == NpTab.lyrics) tab = NpTab.queue;
    final big = tab == NpTab.lyrics && noLyrics;

    // 只切换下面的内容；上面的歌曲信息不参与切换，免得两份叠在一起闪
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
          // 先淡出旧的再淡入新的，不让两份内容半透明地叠在一起
          switchInCurve: const Interval(0.4, 1, curve: Curves.easeOutCubic),
          switchOutCurve: const Interval(0.4, 1, curve: Curves.easeInCubic),
          transitionBuilder: (c, a) => FadeTransition(opacity: a, child: c),
          layoutBuilder: (cur, prev) =>
              Stack(fit: StackFit.expand, children: [...prev, ?cur]),
          child: body,
        ),
      ],
    );

    // 背景固定使用当前歌曲封面的主色（切歌时 CoverTone 平滑过渡）
    return CoverTone(
      coverId: t.cover,
      builder: (context, pal) => ColoredBox(
        color: pal.deep,
        child: ClipRect(
          child: LayoutBuilder(
            builder: (context, box) => Stack(
              children: [
                // 右侧斜放的封面 / MV 画面（随窗口宽高缩放，不侵入左侧歌词区，垂直居中）
                _Art(track: t, playing: app.playing, stageSize: box.biggest),
                // 顶部标题栏区域支持拖动窗口（放在 _TopBar 下层，避免影响按钮点击）
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
    required this.stageSize,
  });
  final Track track;
  final bool playing;
  final Size stageSize;

  // 左侧内容区（left: 40, width: 780）右侧边界 + 安全间距，避免旋转 6° 后压到歌词。
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
        // 暂停时封面轻轻退后
        scale: playing ? 1 : 0.94,
        duration: const Duration(milliseconds: 700),
        curve: const SpringCurve(bounce: 0.15),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 520),
          switchInCurve: Curves.easeOutCubic,
          transitionBuilder: (c, a) => FadeTransition(
            opacity: a,
            child: AnimatedBuilder(
              animation: a,
              builder: (_, cc) => Transform.translate(
                offset: Offset(80 * (1 - a.value), 0),
                child: Transform.rotate(
                  angle: (6 + 6 * (1 - a.value)) * math.pi / 180,
                  child: cc,
                ),
              ),
              child: c,
            ),
          ),
          layoutBuilder: (cur, prev) => Stack(
            alignment: Alignment.centerRight,
            children: [...prev, ?cur],
          ),
          child: art,
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = app.track;
    // 标签组居中；收起在底部播放条末尾（定稿 v32），左上、右上都不放按钮
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

/// 「来自 …」：队列的来处。不知道来处时调用方不放这一行（顶部标签已经写了「正在播放」）。
/// 来处是专辑或歌单时，名字可以点进去。
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

/// 正在播放页上能点的文字：悬停时白 100% + 下划线，点了收起正在播放、打开 [route]。
/// [route] 为空时就是普通文字。[prefix] 不参与点击。
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
    Widget line(bool h) => Text.rich(
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

/// 没有歌词时的大字歌曲信息。
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

// ───────────── 歌词 ─────────────

/// 歌词行高缓存（键含字号、字重、字体、文本）。超过上限就整体清空，避免无限增长。
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

/// 当前行最大，上下渐淡；换行时整列平滑上移，字号也跟着变。
class _Lyrics extends StatefulWidget {
  const _Lyrics();

  @override
  State<_Lyrics> createState() => _LyricsState();
}

class _LyricsState extends State<_Lyrics> with SingleTickerProviderStateMixin {
  /// 用户用滚轮 / 触控板滚动时进入「浏览」：所有行都是小字，排版和当前行
  /// 无关，位置 [_abs] 只听手势；正在唱的行照常往下走，只靠高亮区分。
  /// 停手 3 秒后回到跟随，当前行重新放大。
  bool _scrolling = false;
  double _abs = 0;
  Timer? _back;

  /// 进入浏览的时间：前 520ms 当前行在缩小，行的位置用同样的时长跟上，免得叠在一起。
  DateTime _since = DateTime(0);
  bool get _settling =>
      DateTime.now().difference(_since) < const Duration(milliseconds: 520);

  /// 上一下是鼠标滚轮：一格跳得远，位置用 90ms 补间；触控板和惯性直接跟手。
  bool _wheel = false;

  // 触控板松手后的惯性：按松手前的速度用摩擦减速。
  late final Ticker _fling = createTicker(_onFling);
  FrictionSimulation? _sim;
  double _vel = 0; // px/s，最近几次移动平滑出来的
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

  /// 触控板一次移动：记下速度，松手时用。
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
    // 停住一会儿再松手不算甩
    final idle = DateTime.now().difference(_lastMove).inMilliseconds > 80;
    if (!_scrolling || idle || _vel.abs() < 80) return;
    // 减速快一点；慢到 20px/s 就停，免得尾巴拖很久
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
            // 所有行都按当前行的字排版，断行位置固定；其他行只是整体缩小
            // （缩放不重新排版），切换时就不会跳行。
            const big = 40.0, subBig = 18.0;
            const small = 0.55; // 其他行的歌词缩到 55%（约 22 号）
            const subSmall = 0.8; // 翻译单独缩，其他行的翻译约 14 号

            String main(int i) =>
                mode == LyricMode.trans && ls[i].trans.isNotEmpty
                ? ls[i].trans
                : ls[i].text;
            String? sub(int i) =>
                mode == LyricMode.both && ls[i].trans.isNotEmpty
                ? ls[i].trans
                : null;

            // 每次进度更新都会重新布局；行高按内容和字号缓存，只算一次。
            double measure(
              String s,
              double size,
              FontWeight w,
              F f,
              double h,
            ) => _heights.putIfAbsent('$size|${w.value}|$f|$h|$s', () {
              final tp = TextPainter(
                text: TextSpan(
                  text: s,
                  style: ts(size, w: w, f: f, h: h),
                ),
                textDirection: TextDirection.ltr,
              )..layout(maxWidth: maxW);
              final height = tp.height;
              tp.dispose();
              return height;
            });

            double mainH(int i) => measure(main(i), big, w900, F.wide, 1.1);
            // [big] 是放大的那一行；-1 表示都不放大（浏览时）
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
            // 当前行放在区域约 30% 的高度上
            final anchor = box.maxHeight * 0.30;
            final follow = followTops[playing] - anchor;
            // 往上最多滚到第一行露在顶部渐变下面，往下最多滚到最后一行停在锚点
            final minOff = -(box.maxHeight * 0.08 + 24);
            final maxOff = math.max(minOff, browseTops.last - anchor);
            final offset = _scrolling ? _abs : follow;
            // 开始滚动时当前行缩小，但位置不动，下面的行往上收
            void scroll(double dy) =>
                _scrollBy(dy, browseTops[playing] - anchor, minOff, maxOff);

            return Listener(
              onPointerSignal: (e) {
                // 鼠标滚轮一格的距离太小，放大一些；触控板走下面的 panZoom，跟手不放大
                if (e is PointerScrollEvent) {
                  _stopFling();
                  _wheel = true;
                  scroll(e.scrollDelta.dy * 2.5);
                }
              },
              // 触控板：手指移动距离放大 2 倍，松手后有惯性
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
                      // 整块接住滚动，行与行之间的空隙也能滚
                      const Positioned.fill(
                        child: ColoredBox(color: Color(0x00000000)),
                      ),
                      for (var i = 0; i < ls.length; i++)
                        AnimatedPositioned(
                          key: ValueKey(i),
                          // 手动滚动时跟手，自动跟随时用弹簧
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

  /// [current]：放大的当前行。[browsing]：用户在滚动，正在唱的行（distance 0）
  /// 全亮，其他行统一半透明，滚到远处也看得清。
  final bool current, browsing;

  /// 当前行的字号；其他行同样排版，歌词缩到 [small] 倍、翻译缩到 [subSmall] 倍。
  final double size, subSize, small, subSmall;

  /// 歌词按 [size] 排版时的高度，用来把翻译放在缩小后的歌词正下方。
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
          // 0 = 其他行，1 = 当前行
          tween: Tween(end: current ? 1 : 0),
          duration: const Duration(milliseconds: 520),
          curve: Curves.easeOutCubic,
          builder: (_, k, _) {
            // 只缩放绘制，不改排版：断行永远和当前行一样
            final km = small + (1 - small) * k;
            final ks = subSmall + (1 - subSmall) * k;
            final lyric = Transform.scale(
              scale: km,
              alignment: Alignment.topLeft,
              child: Text(
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
                    child: Text(
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

// ───────────── 播放队列 / 相似歌曲 ─────────────

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
              // 整个列表左移 10，让 hover 底色的左边和标题对齐；
              // 移的是列表本身，裁剪边界跟着走，不会切掉底色
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
                    // 正在播放页不显示滚动条
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

  /// 列表里有 MV 时封面位按 16:9 留 80 宽，否则就是 45 的方形封面，靠左和标题对齐。
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
        // 封面四周都留 10：45 + 10 × 2
        height: 65,
        width: 792,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(14, color: h ? ba(0.16) : ba(0)),
        child: Row(
          children: [
            // 播放按钮放在封面上：和其他列表一样在行首，时长照常显示
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

// ───────────── 底部播放条（封面色上） ─────────────

class _BottomBar extends StatelessWidget {
  const _BottomBar();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // 收起在最左（定稿 v33）
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
          icon: 'repeat',
          tip: app.repeat
              ? context.l10n.miniRepeatOn
              : context.l10n.miniRepeatOff,
          color: app.repeat ? white : wa(0.5),
          dot: app.repeat,
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
      // Sketch 组件 NP Bar「Button Hover」：58×72，圆角 24，#000 12%
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
              final t = app.track;
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
                      child: tx(t.dur, 14, w: w700, c: c, tnum: true),
                    ),
                  ),
                ],
              );
              return Scrubber(
                onChanged: app.scrub,
                onCommit: app.seek,
                builder: (_, at, dragging) => TipAnchor(
                  text: fmtTime((at ?? 0) * t.seconds),
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
                          // 时间画两层：底层白字；黑字只在白色进度条盖住的范围里
                          // 显示。进度边缘压在某个数字中间时，数字一半黑一半白。
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
