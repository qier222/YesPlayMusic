import 'package:flutter/widgets.dart';

import '../theme.dart';

/// 首页加载中的骨架（定稿「插件源 · 首页加载中（骨架）」「首页与发现 · 骨架组件」）：
/// 只画卡片和封面的外框，位置和尺寸跟真实组件一样，内容到了布局不跳。
/// 整页不能滚动，一道很淡的光带从左往右扫。
class HomeSkeleton extends StatelessWidget {
  const HomeSkeleton({super.key, required this.head, required this.layout});

  /// 页面标题，和加载完的页面一样。
  final List<Widget> head;

  /// 区块：「样式:数量」，比如 `shelf:18`。认不出的样式跳过。
  final List<String> layout;

  @override
  Widget build(BuildContext context) => ClipRect(
    child: SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(40, 20, 40, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [...head, SkeletonSections(layout)],
      ),
    ),
  );
}

/// 骨架的区块部分（不带标题和滚动），发现页在顶部分类下面单独用。
class SkeletonSections extends StatefulWidget {
  const SkeletonSections(this.layout, {super.key});
  final List<String> layout;

  @override
  State<SkeletonSections> createState() => _SkeletonSectionsState();
}

class _SkeletonSectionsState extends State<SkeletonSections>
    with SingleTickerProviderStateMixin {
  late final _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final secs = [for (final x in widget.layout) ?_section(x)];
    return Shine(
      animation: _c,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final (i, w) in secs.indexed)
            Padding(
              padding: EdgeInsets.only(top: i == 0 ? 32 : 48),
              child: w,
            ),
        ],
      ),
    );
  }
}

/// 很淡的光带从左往右扫过骨架。
class Shine extends StatelessWidget {
  const Shine({super.key, required this.animation, required this.child});
  final Animation<double> animation;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final shine = P.dark ? wa(0.035) : const Color(0x80FFFFFF);
    return AnimatedBuilder(
      animation: animation,
      builder: (_, child) => ShaderMask(
        blendMode: BlendMode.srcATop,
        shaderCallback: (r) => LinearGradient(
          colors: [
            shine.withValues(alpha: 0),
            shine,
            shine.withValues(alpha: 0),
          ],
          stops: const [0.4, 0.5, 0.6],
          transform: _Slide(
            Curves.easeInOut.transform(animation.value) * 1.4 - 0.7,
          ),
        ).createShader(r),
        child: child,
      ),
      child: child,
    );
  }
}

/// 发现页第一次加载、还不知道有哪些分类时：一排分类卡的外框。
/// [chips] 是下面几排子分类胶囊。
class CategoryBones extends StatelessWidget {
  const CategoryBones({super.key, this.cards = true, this.chips = 0});
  final bool cards;
  final int chips;

  static const _cardW = <double>[
    72.0,
    116,
    92,
    76,
    76,
    76,
    84,
    76,
    76,
    76,
    76,
    76,
  ];
  static const _chipW = <double>[56.0, 56, 56, 56, 56, 56, 56, 56, 68, 84];

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (cards) ...[
        const SizedBox(height: 32),
        SizedBox(
          height: 48,
          child: Row(
            children: [
              Expanded(
                child: ClipRect(
                  child: OverflowBox(
                    alignment: Alignment.centerLeft,
                    maxWidth: double.infinity,
                    child: Row(
                      children: [
                        for (final (i, w) in _cardW.indexed) ...[
                          if (i > 0) const SizedBox(width: 12),
                          _box(w: w, h: 48, r: 14),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              _dot(40),
            ],
          ),
        ),
      ],
      for (var r = 0; r < chips; r++) ...[
        SizedBox(height: r == 0 ? 16 : 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [for (final w in _chipW) _box(w: w, h: 36, r: 18)],
        ),
      ],
    ],
  );
}

class _Slide extends GradientTransform {
  const _Slide(this.dx);
  final double dx;

  @override
  Matrix4 transform(Rect bounds, {TextDirection? textDirection}) =>
      Matrix4.translationValues(bounds.width * dx, 0, 0);
}

Widget? _section(String spec) {
  final i = spec.indexOf(':');
  final style = i < 0 ? spec : spec.substring(0, i);
  final n = i < 0 ? 0 : int.tryParse(spec.substring(i + 1)) ?? 0;
  if (n <= 0) return null;
  return switch (style) {
    'modes' => _Modes(n),
    'shelf' => _Shelf(n),
    'songs' => _Songs(n),
    'charts' => _Charts(n),
    'grid' => _Grid(n),
    'grid+' => _Grid(n, head: true),
    _ => null,
  };
}

// 卡片、封面白 5%，标题条白 7%（浅色时换成黑）。
Color get _card => P.dark ? wa(0.05) : ba(0.04);
Color get _bone => P.dark ? wa(0.07) : ba(0.06);

Widget _box({double? w, double? h, double r = 0, Color? c}) => Container(
  width: w,
  height: h,
  decoration: squircle(r, color: c ?? _card),
);

Widget _dot(double d) => _box(w: d, h: d, r: d / 2);

/// 分区标题：一根标题条，右边放按钮的位置。
Widget _head(double title, [List<Widget> trailing = const []]) => SizedBox(
  height: 32,
  child: Row(
    children: [
      _box(w: title, h: 20, r: 6, c: _bone),
      const Spacer(),
      ...trailing,
    ],
  ),
);

List<Widget> get _pager => [_dot(32), const SizedBox(width: 8), _dot(32)];

class _Modes extends StatelessWidget {
  const _Modes(this.n);
  final int n;

  @override
  Widget build(BuildContext context) {
    final heroes = n.clamp(1, 2);
    final rows = n - heroes;
    return Column(
      children: [
        SizedBox(
          height: 200,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < 2; i++) ...[
                if (i > 0) const SizedBox(width: 24),
                Expanded(child: i < heroes ? _box(r: 20) : const SizedBox()),
              ],
            ],
          ),
        ),
        for (var r = 0; r < rows; r += 3) ...[
          const SizedBox(height: 24),
          SizedBox(
            height: 80,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = r; i < r + 3; i++) ...[
                  if (i > r) const SizedBox(width: 16),
                  Expanded(child: i < rows ? _box(r: 16) : const SizedBox()),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// 和 Shelf 一样算卡片宽度和行数；文字的位置空着。
class _Shelf extends StatelessWidget {
  const _Shelf(this.count);
  final int count;
  static const gap = 24.0;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, c) {
      final n = ((c.maxWidth + gap) / (180 + gap)).floor().clamp(3, 10);
      final w = ((c.maxWidth - gap * n) / (n + 0.5)).floorToDouble();
      final rows = count >= 2 * (n + 1) ? 2 : 1;
      final cols = (count / rows).ceil();
      final scrolls = cols * (w + gap) - gap > c.maxWidth;
      final shown = cols.clamp(0, n + 1);
      // 封面下面：12 间距、标题一行或两行、4 间距、说明一行
      final text = 12.0 + (rows == 2 ? 40 : 20) + 4 + 18;
      final fade = w / 2 + gap;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _head(96, scrolls ? _pager : const []),
          const SizedBox(height: 10),
          ShaderMask(
            blendMode: BlendMode.dstIn,
            shaderCallback: (r) => LinearGradient(
              colors: [
                const Color(0xFFFFFFFF),
                const Color(0xFFFFFFFF),
                scrolls ? const Color(0x00FFFFFF) : const Color(0xFFFFFFFF),
              ],
              stops: [0, 1 - fade / r.width, 1],
            ).createShader(r),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (var col = 0; col < shown; col++) ...[
                    if (col > 0) const SizedBox(width: gap),
                    Column(
                      children: [
                        for (var r = 0; r < rows; r++)
                          if (col * rows + r < count) ...[
                            if (r > 0) const SizedBox(height: 28),
                            _box(w: w, h: w, r: 14),
                            SizedBox(height: text),
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

class _Songs extends StatelessWidget {
  const _Songs(this.count);
  final int count;
  static const per = 12, cols = 3;

  @override
  Widget build(BuildContext context) {
    final shown = count.clamp(0, per);
    final perCol = (shown / cols).ceil();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _head(200, [
          _box(w: 98, h: 32, r: 16),
          if (count > per) ...[const SizedBox(width: 16), ..._pager],
        ]),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var c = 0; c < cols; c++) ...[
              if (c > 0) const SizedBox(width: 32),
              Expanded(
                child: Column(
                  children: [
                    for (
                      var i = c * perCol;
                      i < (c + 1) * perCol && i < shown;
                      i++
                    )
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: _box(h: 40, r: 10),
                      ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _Charts extends StatelessWidget {
  const _Charts(this.count);
  final int count;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _head(96),
      const SizedBox(height: 16),
      SizedBox(
        height: 268,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (var i = 0; i < 4; i++) ...[
              if (i > 0) const SizedBox(width: 16),
              Expanded(child: i < count ? _box(r: 20) : const SizedBox()),
            ],
          ],
        ),
      ),
    ],
  );
}

/// 和 CardGrid 一样铺满整行；最多画两行，下面本来也看不见。
/// [head]：区块有标题。
class _Grid extends StatelessWidget {
  const _Grid(this.count, {this.head = false});
  final int count;
  final bool head;
  static const gap = 24.0;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, c) {
      final n = ((c.maxWidth + gap) / (180 + gap)).floor().clamp(3, 10);
      final w = ((c.maxWidth - gap * (n - 1)) / n).floorToDouble();
      final shown = count.clamp(0, n * 2);
      final grid = Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Wrap(
          spacing: gap,
          runSpacing: 32,
          children: [
            for (var i = 0; i < shown; i++)
              SizedBox(
                width: w,
                height: w + 12 + 20 + 4 + 18,
                child: Align(
                  alignment: Alignment.topLeft,
                  child: _box(w: w, h: w, r: 14),
                ),
              ),
          ],
        ),
      );
      if (!head) return grid;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [_head(96), const SizedBox(height: 10), grid],
      );
    },
  );
}
