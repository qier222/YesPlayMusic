import 'dart:math' as math;

import 'package:file_selector/file_selector.dart';
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

class LibraryPage extends StatelessWidget {
  const LibraryPage({super.key, required this.tab});
  final String tab;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    Widget body;
    Widget? right;
    if (app.library == null) {
      // 本地没扫到音乐、也没选插件：整个音乐库为空（定稿 · 空状态 v30）
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
          top: 140,
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
    // 还在加载、一个都没到的显示省略号
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
    // 整个音乐库为空（没加音乐来源、本地也没歌）：只留空状态，标签和 Coverflow 都不显示
    if (lib == null) return const SizedBox(height: 140);
    return SizedBox(
      height: 140,
      child: Stack(
        children: [
          // 音乐库是侧边栏的一级页面，不放返回按钮
          Positioned(
            right: 40,
            top: 20,
            child: IconBtn(
              'coverflow',
              size: BtnSize.m,
              tip: 'Coverflow',
              onTap: () => app.go('/coverflow/$active'),
            ),
          ),
          Positioned(
            left: 40,
            top: 90,
            child: LineTabs(
              showLine: false,
              items: [for (final t in tabs) (t.$1, t.$2)],
              selected: selected,
              onChanged: (i) => app.replace('/library/${tabs[i].$3}'),
            ),
          ),
          if (right != null) Positioned(right: 40, top: 95, child: right!),
        ],
      ),
    );
  }
}

String _count(int n) =>
    n < 1000 ? '$n' : '${n ~/ 1000},${(n % 1000).toString().padLeft(3, '0')}';

/// 唱片架上的专辑：当前源的音乐库。
List<Album> _shelf(AppState app) => app.library?.albums ?? const [];

/// 空状态在内容区里的位置：定稿里标题在窗口 y≈360，内容区从 140 开始。
Widget _emptyAt(Widget child) =>
    Align(alignment: const Alignment(0, -0.3), child: child);

/// 整个音乐库为空：扫描中提示正在扫描，否则引导添加音乐文件夹或装插件。
class _LibraryEmpty extends StatelessWidget {
  const _LibraryEmpty();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    if (app.scanning) {
      return _emptyAt(_ScanningTitle(l.sourceScanning));
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

/// 扫描中文案：去掉末尾静态省略号，用三个依次淡入的点表示进行中；
/// 点始终占位，避免主文字左右晃动。
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

  /// 第 [i] 个点（0..2）在周期 [v]（0..1）里的透明度：依次淡入，末尾一同淡出。
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
              Text(base, style: style),
              for (var i = 0; i < 3; i++)
                Opacity(
                  opacity: _dotOpacity(v, i).clamp(0.0, 1.0),
                  child: Text('.', style: style),
                ),
            ],
          );
        },
      ),
    );
  }
}

/// 音乐库某个标签还没有内容时：加载中、出错或空。
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

// ═════════════ 专辑：唱片架 ═════════════

/// 书脊卡片上的发行年份，例如「2022」；不知道时为空。
String _releasedText(Album a) {
  final y = a.released?.year ?? a.year;
  return y > 0 ? '$y' : '';
}

/// 发行时间换成可比较的数：有日期用日期，只有年份按年初算，都没有为 null。
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

  // 手感照搬 Coverflow：
  // - 整个唱片架只由一个连续位置 [_anim]（选中下标，可以是小数）决定，
  //   每本的位置和抽出程度都是它的函数，没有各自独立的动画；
  // - 拖动（鼠标、触控板都走 GestureDetector）固定 [_dragPx] 走一本；
  // - 松手按速度多走 0.15 秒，取整，弹簧落位；滚轮一格一本；
  // - 拖动中不改选中，落位时才写回。
  late final AnimationController _anim = AnimationController.unbounded(
    vsync: this,
  )..addStatusListener((_) => mounted ? setState(() {}) : null);
  int _target = -1; // 要停的下标；-1 是还没定位
  double? _drag; // 拖动中的连续位置

  /// 设计稿尺寸：唱片架 + 时间轴在 760 高的区域里（1440×900 窗口）。
  static const _designH = 760.0;

  /// 拖多少（设计稿像素）走一本，和 Coverflow 一样。
  static const _dragPx = 115.0;

  List<Album> _order(int sort) {
    final list = List.of(_shelf(context.appRead));
    if (sort == 0) {
      list.sort(
        (a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()),
      );
    } else {
      // 发行时间：最新的在最左，不知道的放最后，保持原来的顺序
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

  /// 选中第 [i] 本并弹簧滑过去。
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
      // 第一次显示：直接停在选中的那本
      _target = sel;
      _anim.value = sel.toDouble();
    } else if (sel != _target && _drag == null) {
      // 选中从别处变了（排序、菜单）：滑过去
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
      // 整块按窗口高度等比缩放，宽度按比例换算，保证不同窗口大小下比例一致
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
                        // 鼠标滚轮一格一本
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
                            // 两侧边缘渐隐
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
                  // 书架底到时间轴顶 12（定稿 · 音乐库 · 专辑 v16）
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

  /// 时间轴。发行时间排序：专辑加进音乐库的时间，都不知道时按设计稿均匀铺开；
  /// 标题排序：按书架顺序均匀铺开，底下标首字母（定稿 · 书脊时间轴 D′）。
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
    // 发行时间：和书架一样一本一格、最新的在最左，跨度几十年也不会挤在一头。
    // 底下在每年第一本的位置标年份，放不下时优先留整十年、整五年。
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

/// 第 [i] 本在连续位置 [pos] 时的抽出程度：正中间是 1，离开一格就收回成书脊。
/// 和 Coverflow 里正面封面转向侧面一样，只取决于和当前位置的距离。
double _shelfOpen(int i, double pos) => (1 - (i - pos).abs()).clamp(0.0, 1.0);

/// 唱片架排版：书脊从左到右依次排开（间距 4），整体平移使「当前位置」落在正中间。
/// [pos] 可以是小数，在相邻两本的中心之间插值；各本宽度也是 pos 的函数，
/// 所以同一个 pos 排出来永远一样，拖动、停住、动画都不会抖。
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
    // 两端允许拖出去一点（橡皮筋），按最边上那一格外推
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

  /// 抽出程度 0~1，由唱片架的连续位置直接算出（见 [_shelfOpen]）。
  final double open;

  /// 书架静止；只有静止时悬停才让书脊上浮。
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
    // 书脊和卡片用封面提取色
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
                  // 书脊
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
                                  // Align 放松交叉轴约束，文字才会在书脊宽度内居中
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
                  // 抽出的卡片
                  if (o > 0.4)
                    Positioned(
                      left: 20,
                      top: 20,
                      child: Opacity(
                        opacity: ((o - 0.4) / 0.6).clamp(0.0, 1.0),
                        // 只限宽度：中文标题的回退字体行高更大，固定高度会溢出
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
                                // 艺人和发行年份之间留空隙，年份淡一点
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
                                    // 播放整张（插件的先取曲目）
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
                                        // 图标的三角形本身已按视觉重心摆放，不再额外右移
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

/// 唱片架下面的「水柱」刻度（定稿 · 书脊时间轴，悬停样式 D）：
/// 隆起只跟着当前专辑；光标下那根水柱变成白 60% 的指针，上方写它对应的时间或专辑名。
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

  /// 刻度的起止（发行时间排序是年份，标题排序是专辑下标）。
  final double from, to;
  final int current;
  final ValueChanged<int> onPick;

  /// 指针上方的文字：参数是光标处的刻度值和离它最近的专辑。
  final String Function(double pos, int nearest) hoverLabel;

  /// 底部刻度文字；为空时按年份标。
  final List<TickMark>? marks;

  @override
  State<_Timeline> createState() => _TimelineState();
}

class _TimelineState extends State<_Timeline> {
  double? _hx;
  double _lastHx = 0; // 离开后保留，指针淡出时还画在原处

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
          // 指针吸附到最近的刻度
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

/// 刻度文字：[pos] 和时间轴的刻度值同一单位。
/// 放不下时先保留 [strong]，再按 [level] 从高到低，同级按先后。
typedef TickMark = ({double pos, String text, bool strong, int level});

/// 横向刻度。
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

  /// 和定稿 Shelf Timeline 一致（以水柱底边 [base] 为基准）：
  /// 悬停文字 0–12，三角形 12–18，留 6 的空隙，当前水柱 24–44，刻度文字从 54 开始。
  static const label = 12.0, arrow = 6.0, gap = 6.0, column = 20.0;
  static const base = label + arrow + gap + column, height = base + 24;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final strong = Paint()..color = ink;
    // 当前位置吸附到最近的刻度，白色水柱、三角形和隆起都以它为准
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
    // 三角形 10×6，尖端离当前水柱上沿留 [gap]
    const triTip = base - column - gap;
    final tri = Path()
      ..moveTo(cx - 3.5, triTip - arrow)
      ..lineTo(cx + 6.5, triTip - arrow)
      ..lineTo(cx + 1.5, triTip)
      ..close();
    canvas.drawPath(tri, strong);
    // 指针上方的时间 / 专辑名，写在三角形上面那一行
    if (hoverT > 0 && hover != ci && hoverLabel.isNotEmpty) {
      final tp = TextPainter(
        text: TextSpan(
          text: hoverLabel,
          style: ts(
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
    // 先排好每个文字的位置，再按优先级放，和已放的挤在一起就不画
    final laid = <(TickMark, TextPainter, double)>[];
    for (final (i, m) in ms.indexed) {
      final x = (m.pos - from) / (to - from) * (w - 3);
      final tp = TextPainter(
        text: TextSpan(
          text: m.text,
          style: ts(
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

// ═════════════ 歌曲 ═════════════

class _SongsBody extends StatefulWidget {
  const _SongsBody();

  @override
  State<_SongsBody> createState() => _SongsBodyState();
}

class _SongsBodyState extends State<_SongsBody> {
  final _scroll = ScrollController();
  double _frac = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      final max = _scroll.position.maxScrollExtent;
      setState(
        () => _frac = max <= 0 ? 0 : (_scroll.offset / max).clamp(0.0, 1.0),
      );
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
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
    // 一行一个：月份标题或歌曲。歌曲可能有几千首，按需构建。
    final rows =
        <(({SongMonth month, int? year, int? monthNum}), SongRow?, int)>[];
    for (final m in months) {
      rows.add((m, null, rows.isEmpty ? 0 : 1));
      for (final r in m.month.rows) {
        rows.add((m, r, 0));
      }
    }
    final seconds = tracks.fold<int>(0, (a, t) => a + t.seconds);
    final years = <String>{
      for (final m in months)
        if (m.year != null) '${m.year}',
    }.toList();
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
          child: Stack(
            children: [
              ListView.builder(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(32, 28, 122, 200),
                itemCount: rows.length,
                itemBuilder: (_, i) {
                  final (m, r, gap) = rows[i];
                  if (r == null) {
                    return Padding(
                      padding: EdgeInsets.fromLTRB(8, gap == 0 ? 0 : 22, 8, 17),
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
                      onPlay: () =>
                          app.playList(tracks, start: r.n - 1, from: 'library'),
                    ),
                  );
                },
              ),
              Positioned(
                right: 24,
                top: 24,
                child: _YearScrubber(
                  frac: _frac,
                  years: years,
                  labelAt: (f) {
                    if (rows.isEmpty) return '';
                    // 按行数估算该滚动位置的那一行，取它所在月份
                    final m = rows[(f * (rows.length - 1)).round()].$1;
                    return m.year == null || m.monthNum == null
                        ? m.month.label
                        : '${m.year}.${'${m.monthNum}'.padLeft(2, '0')}';
                  },
                  onPick: (f) {
                    if (!_scroll.hasClients) return;
                    _scroll.animateTo(
                      f * _scroll.position.maxScrollExtent,
                      duration: const Duration(milliseconds: 420),
                      curve: Curves.easeOutCubic,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// 新加的在前；不知道时间的放最后，保持原来的顺序。
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

/// 按加进来的月份分组；[ts] 已按时间排好。行号是在 [ts] 里的位置 + 1。
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

/// 「加入时间」列的文字：今天、昨天、几天前、几月几日。
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

  /// 从这首开始播放（整个列表进队列）。
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
            // 和专辑页一样：悬停出现爱心，已喜欢的歌常驻红心
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

  /// 未收藏时的颜色，默认 P.muted（专辑页传跟时长一样的颜色）
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

/// 歌曲列表右侧竖着的「水柱」刻度，跟专辑页下面那条是一套（悬停样式 D）：
/// 隆起只跟着当前位置；光标下那根水柱变成白 60% 的指针，左边写它对应的月份。
class _YearScrubber extends StatefulWidget {
  const _YearScrubber({
    required this.frac,
    required this.onPick,
    this.years,
    this.labelAt,
  });
  final double frac;

  /// 从新到旧的年份标签；为空时用设计稿的 2026~2021。
  final List<String>? years;
  final ValueChanged<double> onPick;

  /// 滚动位置 [0, 1] 处的时间，写在指针旁边。
  final String Function(double frac)? labelAt;

  @override
  State<_YearScrubber> createState() => _YearScrubberState();
}

class _YearScrubberState extends State<_YearScrubber> {
  double? _hy; // 悬停的纵坐标
  double _lastHy = 0; // 离开后保留，指针淡出时还画在原处
  static const n = 56;
  static const step = 9.786;

  static double _frac(double y) => ((y / step - 3) / (n - 4)).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    final cur = (3 + widget.frac * (n - 4)).round();
    // 指针吸附到最近的刻度
    final hi = ((_lastHy - 1.5) / step).round().clamp(0, n - 1);
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onHover: (e) => setState(() => _hy = _lastHy = e.localPosition.dy),
      onExit: (_) => setState(() => _hy = null),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapUp: (d) => widget.onPick(_frac(d.localPosition.dy)),
        onVerticalDragUpdate: (d) => widget.onPick(_frac(d.localPosition.dy)),
        child: TweenAnimationBuilder<double>(
          tween: Tween(end: _hy != null ? 1 : 0),
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          builder: (_, t, _) => CustomPaint(
            size: const Size(44, n * step),
            painter: _VTicks(
              cur: cur,
              hover: hi,
              hoverT: t,
              hoverLabel: t > 0 && widget.labelAt != null
                  ? widget.labelAt!(_frac(hi * step + 1.5))
                  : '',
              ink: P.dark ? white : darkInk,
              years: widget.years,
            ),
          ),
        ),
      ),
    );
  }
}

class _VTicks extends CustomPainter {
  _VTicks({
    required this.cur,
    required this.ink,
    this.hover = -1,
    this.hoverT = 0,
    this.hoverLabel = '',
    this.years,
  });
  final int cur, hover;
  final double hoverT;
  final String hoverLabel;
  final Color ink;
  final List<String>? years;

  @override
  void paint(Canvas canvas, Size size) {
    const step = _YearScrubberState.step;
    const right = 20.0;
    final strong = Paint()..color = ink;
    final peak = cur * step + 1.5;
    for (var i = 0; i < _YearScrubberState.n; i++) {
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
    // 指针旁的时间，写在三角形那一列：右对齐、和水柱垂直居中
    if (hoverT > 0 && hover != cur && hoverLabel.isNotEmpty) {
      final tp = TextPainter(
        text: TextSpan(
          text: hoverLabel,
          style: ts(
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
        Offset(right - 21 - tp.width, hover * step + 1.5 - tp.height / 2),
      );
    }
    const ys = [10.0, 103.6, 211.3, 318.9, 426.6, 520.2];
    final labels = years ?? [for (var i = 0; i < ys.length; i++) '${2026 - i}'];
    for (var i = 0; i < ys.length && i < labels.length; i++) {
      final tp = TextPainter(
        text: TextSpan(
          text: labels[i],
          style: ts(10, w: w600, c: ink.withValues(alpha: 0.4)),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      canvas.save();
      canvas.translate(33 + tp.height, ys[i] - tp.width / 2 + 10);
      canvas.rotate(math.pi / 2);
      tp.paint(canvas, Offset.zero);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_VTicks old) =>
      old.cur != cur ||
      old.hover != hover ||
      old.hoverT != hoverT ||
      old.hoverLabel != hoverLabel ||
      old.ink != ink ||
      old.years != years;
}

// ═════════════ 歌单 ═════════════

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
    // 卡片底色和文字颜色都从封面提取
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

// ═════════════ 艺人：气泡 ═════════════

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

/// 真实艺人的气泡：歌多的大、排在中间，向外螺旋铺开，可以上下滚动。
class _ArtistCloud extends StatelessWidget {
  const _ArtistCloud({required this.artists});
  final List<LibraryArtist> artists;

  // 设计稿里气泡直径 96~184
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

/// 气泡排版：从中心沿螺线往外，每个气泡放在第一个不和已有气泡（含名字）
/// 重叠的位置；只受宽度限制，高度随数量增长。按列表和宽度缓存。
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
    // 每步沿螺线走大约 8 像素
    for (var ang = 0.0, rad = 0.0; rad < 100000; ang += 8 / math.max(rad, 8)) {
      rad = 4.0 * ang;
      p = Offset(cx + rad * math.cos(ang), rad * 0.6 * math.sin(ang));
      if (p.dx - r < 0 || p.dx + r > width) continue;
      final free = out.every((q) {
        final need = r + q.$3 / 2 + gap;
        final dx = p.dx - q.$2.dx;
        // 下面那个气泡还要让出上面那个的名字
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

/// 封面；没有封面时是一块带音符的底色。
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

  /// 艺人页；为空时不能点。
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
