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
const _designCoverTop = 172.0; // 设计稿正面封面 y = 172
const _designCenterY = _designCoverTop + _designSize / 2;

// 仿 iPod Coverflow：所有封面共用一个视点（舞台中央），侧边封面不缩小，
// 而是转 75° 后推远，靠中间的一边远、外边近；第一张的内边贴着正面封面。
// 下面的 3D 长度都是 900 高设计稿的基准值，运行时按窗口高度等比缩放。
const _angle = 75.0;
const _camera = 2000.0; // 视点到舞台的距离（透视强度）
const _gap1 = 420.0; // 第一张侧边封面中心离正中的距离（3D 空间）
const _depth = 745.0; // 侧边封面推远多少
const _step = 165.0; // 侧边封面之间的间距（3D 空间）
const _pace = 120.0; // 屏幕上大约多少像素换一张：拖动和可见范围按它算

/// 按窗口尺寸换算后的 Coverflow 舞台布局与 3D 几何参数。
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
    // 以 900 高设计稿为基准，按窗口高度等比缩放；极窄窗口下也受宽度约束，避免封面撑满屏幕。
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

/// 四个标签，和音乐库的路由、SourceLibrary 的部分名一一对应。
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

/// Coverflow 里的一张封面。
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

  /// 点进去的页面；为空就不能点进去。
  final String route;

  /// 播放它。
  final VoidCallback? play;

  /// 歌曲的 key，用来判断正面这首是不是正在播放。
  final String? trackKey;

  /// 专辑、歌单、艺人放起来后的 [AppState.queueFrom]，用来判断它是不是正在播放。
  final String? from;

  /// 艺人封面用圆形显示。
  final bool round;

  /// 艺人在当前源里的 id；头像还没取到时按需补取。
  final String artistId;

  /// [cover] 本身已经是艺人头像。
  final bool hasAvatar;

  bool playingIn(AppState app) =>
      (trackKey != null && app.track.key == trackKey) ||
      (from != null && app.queueFrom == from);
}

String _count(int n) =>
    n < 1000 ? '$n' : '${n ~/ 1000},${(n % 1000).toString().padLeft(3, '0')}';

class CoverflowPage extends StatefulWidget {
  const CoverflowPage({super.key, this.tab = 'albums'});

  /// 打开时选中的标签：songs、albums、playlists、artists。
  final String tab;

  @override
  State<CoverflowPage> createState() => _CoverflowPageState();
}

class _CoverflowPageState extends State<CoverflowPage>
    with SingleTickerProviderStateMixin {
  int _target = 0;
  late int _tab = math.max(0, _tabs.indexOf(widget.tab));
  bool _frontHover = false;
  int _dir = 0; // 上一次移动的方向：1 往右翻（新封面从右边来），-1 往左，0 换标签
  bool _placed = false; // 当前标签已经定位到起始封面
  String? _lastTrackKey; // 歌曲页里上一次见到的正在播放曲目，切歌时自动滚过去
  double? _drag; // 拖动中的连续位置
  late final AnimationController _anim = AnimationController.unbounded(
    vsync: this,
  );
  final _focus = FocusNode();

  List<_Item> _items = const [];
  Object? _itemsSrc = const Object(); // _items 由哪个列表生成，没变就不重建
  int _itemsTab = -1;
  Locale? _itemsLocale;
  final Map<String, String> _artistAvatars = {}; // '$source/$id' -> avatar url
  final Set<String> _artistAvatarLoading = {};

  /// 取这张封面要显示的图片：艺人优先用真正的头像（缓存或按需拉取）。
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

  /// 当前标签的封面：当前源的音乐库；没有音乐库时是空的。
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

  /// 刚打开或换标签时停在哪张：正在播放的那首（歌曲）/ 那张专辑。
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
      // 第一次有内容（或换了标签）：直接跳到起始封面，不播动画
      _placed = true;
      _lastTrackKey = trackKey;
      _anim.stop();
      _target = _start(app, items);
      _anim.value = _target.toDouble();
    } else {
      if (_target >= n) {
        // 音乐库重新加载后变少了
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
                // 上半部分背景：当前封面的主色，向下渐变到黑；切换封面时颜色平滑过渡
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
                            // 空状态没有封面：中性深灰渐到黑（定稿 · Coverflow 空）
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
                // 封面带（按窗口高度等比缩放）
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
                            // 曲库可能有几千首，只排屏幕上看得到的那一段
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
                // 倒影下沿渐隐
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
                // 当前标签还没有内容：加载中、出错或空（定稿 · Coverflow 空 v30）
                if (n == 0 && !app.scanning)
                  Positioned.fill(
                    left: 40,
                    right: 40,
                    child: Align(
                      alignment: const Alignment(0, -0.04),
                      child: _emptyMessage(app),
                    ),
                  ),
                // 顶部标题栏拖动区（置于顶部按钮下层）
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
                // 封面下方标题与艺人
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
                        // 跟着封面运动方向横移：新标题从翻过来的那一侧进来，
                        // 旧标题往另一侧出去
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

  /// 一张封面图；没有封面或加载失败时是深灰底加图标。
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
    // 解码宽度按 128px 向上取整，拖拽缩放窗口时不会每一像素都重新解码。
    final cacheW = (((size * dpr) / 128).ceil() * 128).clamp(128, 4096);
    return Image(
      // 本地 / 网络封面可能很大，按显示尺寸解码；倒影用同一个缓存
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
    // 正面封面的主操作：正在播放的那首切换播放 / 暂停；其余播放它，
    // 不能播放的点进去。
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
    // 内边（靠中间那条）投影到屏幕上的位置；它都出了舞台就不用画
    final inX = off - size / 2 * math.cos(a);
    final inZ = z + size / 2 * math.sin(a);
    if (inX * metrics.camera / (metrics.camera + inZ) > stageW / 2) return null;
    // Flutter 的 rotateY 方向与设计工具相反：正角度让左边往里退
    final rot = sign * a;
    final shade = math.min(0.08 * ad, 0.48);
    final refl = math.max(0.24 - 0.02 * ad, 0.12);
    final btnSize = (80.0 * metrics.scale).clamp(64.0, 108.0);
    final btnIconSize = (36.0 * metrics.scale).clamp(28.0, 48.0);

    // 透视 × 平移 × 旋转：每张都放在舞台正中再移开，视点因此是共用的
    final m = Matrix4.identity()
      ..setEntry(3, 2, 1 / metrics.camera)
      ..translateByDouble(sign * off, 0, z, 1)
      ..rotateY(rot);

    Widget artContent = Stack(
      fit: StackFit.expand,
      children: [
        _art(cover, size, dpr, round: it.round),
        if (shade > 0.005) ColoredBox(color: ba(shade)),
        // 悬停当前正面封面时出现播放 / 暂停浮层（Sketch: 25% 黑遮罩 + 80 白圆 + 36 图标）
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
        // 原点 = 封面中心（下面还挂着 0.42 高的倒影），侧边封面上下居中对齐
        alignment: const Alignment(0, 0.5 / 1.42 * 2 - 1),
        transform: m,
        child: GestureDetector(
          onTap: isFront ? null : () => _goTo(i),
          onDoubleTap: isFront ? action : null,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              art,
              // 倒影
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
