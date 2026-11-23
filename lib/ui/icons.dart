// Common widgets: icons, covers.

import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../data.dart';
import '../theme.dart';

// ───────────── Icons / covers ─────────────

/// AnimatedSwitcher's default transition puts the child's key on the FadeTransition,
/// so when switching back and forth quickly (e.g. sweeping over list rows while scrolling) the fading-out old widget and the new one share a key
/// and throw Duplicate keys. Always use this keyless version instead.
Widget fadeOnly(Widget child, Animation<double> animation) =>
    FadeTransition(opacity: animation, child: child);

/// Icons come in only three sizes, 24 / 20 / 16, each with an SVG set pixel-aligned to its own grid.
/// （assets/icons、assets/icons/20、assets/icons/16）。
///
/// These three sizes display pre-rendered PNGs (`assets/icons/png/<size>/`, with 2.0x and 3.0x),
/// not SVGs drawn live: Flutter anti-aliases thin paths with only 4 gray levels (both Impeller and
/// Skia), so diagonals and curves look stepped; PNGs rendered with resvg have edges as smooth as Sketch.
/// Regenerate the PNGs after changing an SVG. Large icons over 24 (cover placeholders, the big play button on Now Playing)
/// and other sizes still draw SVGs.
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
      // Icons are decorative: button names come from the tooltip or nearby text
      excludeFromSemantics: true,
    );
  }
}

/// A cover clipped with rounded corners.
class Cover extends StatelessWidget {
  const Cover(this.id, {super.key, this.w, this.h, this.r = 8, this.scale = 1});
  final String id;
  final double? w, h;
  final double r;
  final double scale;

  @override
  Widget build(BuildContext context) {
    // Local/network covers can be thousands of pixels; decode at display size so lists don't decode full-size images.
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
