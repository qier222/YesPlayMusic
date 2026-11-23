import 'dart:io';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'cache/image_cache.dart';

/// A set of colors extracted from a cover.
///
/// - [dominant]: the most representative color in the cover (original, unadjusted).
/// - [deep]: a darkened version for large backgrounds (Now Playing, Coverflow, album page header, playlist detail panel),
///   keeping white text readable, with lightness close to the Moon River burgundy #7B1D2E in the design.
/// - [card]: card background, keeping the cover's own lightness (a light cover gives a light card).
/// - [onCard]: text color on the card, white or black depending on the brightness of [card].
@immutable
class CoverPalette {
  const CoverPalette({
    required this.dominant,
    required this.deep,
    required this.card,
    required this.onCard,
  });

  final Color dominant, deep, card, onCard;

  /// Whether the card background is light (needs dark text).
  bool get darkText => onCard != const Color(0xFFFFFFFF);

  static const fallback = CoverPalette(
    dominant: Color(0xFF7B1D2E),
    deep: Color(0xFF7B1D2E),
    card: Color(0xFF7B1D2E),
    onCard: Color(0xFFFFFFFF),
  );

  /// Pure function: computes the palette from RGBA pixels. Separate so it can be tested.
  factory CoverPalette.fromPixels(Uint8List rgba) {
    final dominant = _dominant(rgba);
    return CoverPalette.fromColor(dominant);
  }

  factory CoverPalette.fromColor(Color c) {
    final hsl = HSLColor.fromColor(c);
    // Nearly colorless covers (black-and-white photos etc.) stay neutral instead of inventing a hue
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

/// Dominant color algorithm:
/// 1. Quantize each channel to 4 bits (4096 buckets), counting pixels and summing colors;
/// 2. Score each bucket = count × (0.01 + chroma²), down-weighting too dark / too light buckets, so vivid, large areas win;
/// 3. Around the winning bucket's hue, average the vivid enough pixels within ±18° again for a steadier result;
/// 4. With too few colorful pixels (<4%) the cover is treated as black-and-white and the overall average is returned.
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
    // Chroma squared: a small but vivid color (e.g. a red coat) can beat a large gray-brown background
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

/// Cover color cache. At launch [preload] all covers, so pages can get colors synchronously;
/// covers not preloaded are computed asynchronously, notifying listeners to rebuild when done.
class CoverColors extends ChangeNotifier {
  CoverColors._();
  static final instance = CoverColors._();

  final _cache = <String, CoverPalette>{};
  final _pending = <String, Future<CoverPalette>>{};

  /// Gets colors synchronously; returns null and starts computing if not ready yet.
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
      // Shares the disk cache with cover display, downloads only once
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

/// Picks colors from the cover and transitions smoothly when the cover changes.
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
      // Text color doesn't animate; it switches halfway
      onCard: t < 0.5 ? a.onCard : b.onCard,
    );
  }
}
