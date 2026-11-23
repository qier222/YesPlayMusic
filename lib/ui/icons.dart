// 通用组件：图标、封面。

import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../data.dart';
import '../theme.dart';

// ───────────── 图标 / 封面 ─────────────

/// AnimatedSwitcher 的默认过渡会把子组件的 key 挂到 FadeTransition 上，
/// 快速来回切换（比如滚动时划过列表行）时，淡出中的旧组件和新组件 key 相同，
/// 会报 Duplicate keys。统一用这个不带 key 的版本。
Widget fadeOnly(Widget child, Animation<double> animation) =>
    FadeTransition(opacity: animation, child: child);

/// 图标只有 24 / 20 / 16 三档，每档有按自己网格做过像素对齐的一套 SVG
/// （assets/icons、assets/icons/20、assets/icons/16）。
///
/// 这三档显示的是预先渲染好的 PNG（assets/icons/png/<档>/，带 2.0x、3.0x），
/// 不是现场画 SVG：Flutter 画细线路径只有 4 档灰度的抗锯齿（Impeller 和
/// Skia 都是），斜线和曲线有台阶；PNG 用 resvg 渲染，边缘和 Sketch 一样顺。
/// 改了 SVG 要重新生成 PNG。超过 24 的大图标（封面占位、正在播放的大播放键）
/// 和其他尺寸还是画 SVG。
class Ico extends StatelessWidget {
  const Ico(this.name, {super.key, this.size = 20, this.color});
  final String name;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = color ?? P.ink;
    if (size == 16 || size == 20 || size == 24) {
      return Image.asset(
        'assets/icons/png/${size.toInt()}/$name.png',
        width: size,
        height: size,
        color: c,
        colorBlendMode: BlendMode.srcIn,
        filterQuality: FilterQuality.medium,
        gaplessPlayback: true,
        excludeFromSemantics: true,
      );
    }
    return SvgPicture.asset(
      size <= 16
          ? 'assets/icons/16/$name.svg'
          : size <= 20
          ? 'assets/icons/20/$name.svg'
          : 'assets/icons/$name.svg',
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(c, BlendMode.srcIn),
      // 图标是装饰：按钮的名字来自提示文字或旁边的文字
      excludeFromSemantics: true,
    );
  }
}

/// 圆角裁切的封面。
class Cover extends StatelessWidget {
  const Cover(this.id, {super.key, this.w, this.h, this.r = 8, this.scale = 1});
  final String id;
  final double? w, h;
  final double r;
  final double scale;

  @override
  Widget build(BuildContext context) {
    // 本地/网络封面可能有几千像素，按显示尺寸解码，避免列表里解出整张大图。
    final dpr = MediaQuery.maybeDevicePixelRatioOf(context) ?? 2;
    final px = w == null ? null : (w! * scale * dpr).ceil();
    Widget img = Image(
      image: ResizeImage.resizeIfNeeded(px, null, coverImage(id)),
      width: w,
      height: h,
      fit: BoxFit.cover,
      filterQuality: FilterQuality.medium,
      gaplessPlayback: true,
      errorBuilder: (_, _, _) =>
          Container(width: w, height: h, color: P.raised),
    );
    if (scale != 1) img = Transform.scale(scale: scale, child: img);
    final child = SizedBox(width: w, height: h, child: img);
    return ClipRSuperellipse(
      borderRadius: BorderRadius.circular(r),
      child: child,
    );
  }
}
