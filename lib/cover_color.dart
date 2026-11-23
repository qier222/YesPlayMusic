import 'dart:io';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'cache/image_cache.dart';

/// 从封面提取出来的一组颜色。
///
/// - [dominant]：封面里最有代表性的颜色（原色，未调整）。
/// - [deep]：压暗后的版本，用作大面积背景（正在播放、Coverflow、专辑页顶部、歌单详情面板），
///   保证白字可读，明度和设计稿里 Moon River 的酒红 #7B1D2E 接近。
/// - [card]：卡片底色，保留封面本身的明暗倾向（浅色封面得到浅色卡片）。
/// - [onCard]：卡片上的文字颜色，按 [card] 的亮度在白/黑之间选。
@immutable
class CoverPalette {
  const CoverPalette({
    required this.dominant,
    required this.deep,
    required this.card,
    required this.onCard,
  });

  final Color dominant, deep, card, onCard;

  /// 卡片底色是否偏浅（需要深色文字）。
  bool get darkText => onCard != const Color(0xFFFFFFFF);

  static const fallback = CoverPalette(
    dominant: Color(0xFF7B1D2E),
    deep: Color(0xFF7B1D2E),
    card: Color(0xFF7B1D2E),
    onCard: Color(0xFFFFFFFF),
  );

  /// 纯函数：从 RGBA 像素里算出调色板。单独拿出来方便测试。
  factory CoverPalette.fromPixels(Uint8List rgba) {
    final dominant = _dominant(rgba);
    return CoverPalette.fromColor(dominant);
  }

  factory CoverPalette.fromColor(Color c) {
    final hsl = HSLColor.fromColor(c);
    // 几乎没有颜色的封面（黑白照片等）保持中性，不硬造色相
    final chromatic = hsl.saturation > 0.12;
    final s = chromatic ? math.min(hsl.saturation, 0.72) : 0.0;
    final deep = HSLColor.fromAHSL(
      1,
      hsl.hue,
      s,
      chromatic ? 0.3 : 0.2,
    ).toColor();
    final card = HSLColor.fromAHSL(
      1,
      hsl.hue,
      s,
      hsl.lightness.clamp(0.3, 0.82),
    ).toColor();
    final onCard = card.computeLuminance() > 0.42
        ? const Color(0xFF0B0B0D)
        : const Color(0xFFFFFFFF);
    return CoverPalette(dominant: c, deep: deep, card: card, onCard: onCard);
  }
}

/// 主色算法：
/// 1. 每通道量化到 4 bit（4096 个桶），统计数量和颜色总和；
/// 2. 每个桶打分 = 数量 × (0.01 + 彩度²)，太暗、太亮的桶降权，鲜艳且面积大的颜色胜出；
/// 3. 以胜出桶的色相为中心，把 ±18° 内足够鲜艳的像素再平均一次，结果更稳定；
/// 4. 彩色像素太少（<4%）时认为是黑白封面，返回整体平均色。
Color _dominant(Uint8List rgba) {
  final count = Int32List(4096);
  final sumR = Int32List(4096), sumG = Int32List(4096), sumB = Int32List(4096);
  var total = 0, ar = 0, ag = 0, ab = 0;
  for (var i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) continue;
    final r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    final k = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
    count[k]++;
    sumR[k] += r;
    sumG[k] += g;
    sumB[k] += b;
    total++;
    ar += r;
    ag += g;
    ab += b;
  }
  if (total == 0) return CoverPalette.fallback.dominant;
  final average = Color.fromARGB(255, ar ~/ total, ag ~/ total, ab ~/ total);

  var best = -1;
  var bestScore = 0.0;
  var chromaticPixels = 0;
  for (var k = 0; k < 4096; k++) {
    final n = count[k];
    if (n == 0) continue;
    final r = sumR[k] / n / 255, g = sumG[k] / n / 255, b = sumB[k] / n / 255;
    final mx = math.max(r, math.max(g, b)), mn = math.min(r, math.min(g, b));
    final chroma = mx - mn;
    final l = (mx + mn) / 2;
    if (chroma > 0.16) chromaticPixels += n;
    // 彩度平方：小面积但鲜艳的颜色（比如红外套）能压过大片灰褐背景
    var w = 0.01 + chroma * chroma;
    if (l < 0.12 || l > 0.92) w *= 0.15;
    final score = n * w;
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  if (best < 0 || chromaticPixels < total * 0.04) return average;

  final seed = HSLColor.fromColor(
    Color.fromARGB(
      255,
      sumR[best] ~/ count[best],
      sumG[best] ~/ count[best],
      sumB[best] ~/ count[best],
    ),
  );
  var n = 0, r = 0, g = 0, b = 0;
  for (var k = 0; k < 4096; k++) {
    final c = count[k];
    if (c == 0) continue;
    final col = Color.fromARGB(255, sumR[k] ~/ c, sumG[k] ~/ c, sumB[k] ~/ c);
    final h = HSLColor.fromColor(col);
    if (h.saturation < 0.2 || h.lightness < 0.12 || h.lightness > 0.92) {
      continue;
    }
    final dh = (h.hue - seed.hue).abs();
    if (math.min(dh, 360 - dh) > 18) continue;
    n += c;
    r += sumR[k];
    g += sumG[k];
    b += sumB[k];
  }
  if (n == 0) return seed.toColor();
  return Color.fromARGB(255, r ~/ n, g ~/ n, b ~/ n);
}

/// 封面颜色缓存。启动时 [preload] 全部封面，之后页面里可以同步取色；
/// 没预加载到的封面会异步计算，算完通知监听者重建。
class CoverColors extends ChangeNotifier {
  CoverColors._();
  static final instance = CoverColors._();

  final _cache = <String, CoverPalette>{};
  final _pending = <String, Future<CoverPalette>>{};

  /// 同步取色；还没算出来时返回 null 并开始计算。
  CoverPalette? peek(String coverId) {
    final hit = _cache[coverId];
    if (hit == null) load(coverId);
    return hit;
  }

  Future<CoverPalette> load(String coverId) {
    final hit = _cache[coverId];
    if (hit != null) return SynchronousFuture(hit);
    return _pending[coverId] ??= _extract(coverId).then((p) {
      _cache[coverId] = p;
      _pending.remove(coverId);
      notifyListeners();
      return p;
    });
  }

  Future<void> preload(Iterable<String> coverIds) =>
      Future.wait(coverIds.toSet().map(load));

  static Future<Uint8List> _bytes(String id) async {
    if (id.startsWith('http://') || id.startsWith('https://')) {
      // 和封面显示同一份磁盘缓存，只下载一次
      return ImageDiskCache.instance.bytes(id);
    }
    final path = id.startsWith('file://') ? Uri.parse(id).toFilePath() : id;
    return File(path).readAsBytes();
  }

  static Future<CoverPalette> _extract(String coverId) async {
    try {
      final codec = await ui.instantiateImageCodec(
        await _bytes(coverId),
        targetWidth: 48,
        targetHeight: 48,
      );
      final frame = await codec.getNextFrame();
      final bytes = await frame.image.toByteData(
        format: ui.ImageByteFormat.rawRgba,
      );
      frame.image.dispose();
      codec.dispose();
      if (bytes == null) return CoverPalette.fallback;
      return CoverPalette.fromPixels(bytes.buffer.asUint8List());
    } catch (_) {
      return CoverPalette.fallback;
    }
  }
}

/// 按封面取色并在封面切换时平滑过渡。
///
/// ```dart
/// CoverTone(coverId: al.cover, builder: (context, p) => Container(color: p.deep))
/// ```
class CoverTone extends StatelessWidget {
  const CoverTone({
    super.key,
    required this.coverId,
    required this.builder,
    this.duration = const Duration(milliseconds: 500),
  });

  final String coverId;
  final Widget Function(BuildContext context, CoverPalette palette) builder;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: CoverColors.instance,
      builder: (context, _) {
        final p = CoverColors.instance.peek(coverId) ?? CoverPalette.fallback;
        return TweenAnimationBuilder<CoverPalette>(
          tween: _PaletteTween(end: p),
          duration: duration,
          curve: Curves.easeOutCubic,
          builder: (context, v, _) => builder(context, v),
        );
      },
    );
  }
}

class _PaletteTween extends Tween<CoverPalette> {
  _PaletteTween({super.end});

  @override
  CoverPalette lerp(double t) {
    final a = begin ?? end!, b = end!;
    return CoverPalette(
      dominant: Color.lerp(a.dominant, b.dominant, t)!,
      deep: Color.lerp(a.deep, b.deep, t)!,
      card: Color.lerp(a.card, b.card, t)!,
      // 文字颜色不渐变，过半时切换
      onCard: t < 0.5 ? a.onCard : b.onCard,
    );
  }
}
