import 'dart:math' as math;

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/pages/artist_cloud_layout.dart';
import 'package:yesplaymusic/state.dart';

void main() {
  test('empty artist cloud has no bubbles or height', () {
    final (bubbles, height) = layoutArtistCloud([], 1120);
    expect(bubbles, isEmpty);
    expect(height, 0.0);
  });

  test('small artist cloud preserves the first free spiral positions', () {
    final artists = _artists([100, 100, 99, 17, 0]);
    for (final width in [220.0, 1120.0, 1340.0]) {
      _expectSameLayout(artists, width);
    }
  });

  test('mixed weights preserve placement across diameter changes', () {
    final random = math.Random(52);
    final weights = List.generate(50, (_) => random.nextInt(100))
      ..sort((a, b) => b.compareTo(a));
    final artists = _artists(weights);
    for (final width in [960.0, 1320.0]) {
      _expectSameLayout(artists, width);
    }
  });

  test('700 equal weights preserve every spiral position', () {
    final artists = _artists(List.filled(700, 1));
    // Skip repeated prefixes so the all-pairs oracle is tractable at this size.
    _expectSameLayout(artists, 1288, reuseEqualWeightPrefix: true);
  });
}

List<LibraryArtist> _artists(List<int> weights) => [
  for (final (i, weight) in weights.indexed)
    LibraryArtist(name: 'Artist $i', cover: '', route: '', weight: weight),
];

void _expectSameLayout(
  List<LibraryArtist> artists,
  double width, {
  bool reuseEqualWeightPrefix = false,
}) {
  final (bubbles, height) = layoutArtistCloud(artists, width);
  final (legacyBubbles, legacyHeight) = _legacyCloud(
    artists,
    width,
    reuseEqualWeightPrefix: reuseEqualWeightPrefix,
  );
  expect(bubbles, legacyBubbles);
  expect(height, legacyHeight);
}

(List<(LibraryArtist, Offset, double)>, double) _legacyCloud(
  List<LibraryArtist> artists,
  double width, {
  required bool reuseEqualWeightPrefix,
}) {
  const minD = 96.0, maxD = 184.0, label = 28.0, gap = 18.0;
  final top = artists.isEmpty ? 1 : math.max(1, artists.first.weight);
  final cx = width / 2;
  final out = <(LibraryArtist, Offset, double)>[];
  var next = 0.0;
  for (final a in artists) {
    final d = (minD + (maxD - minD) * math.sqrt(a.weight / top))
        .clamp(minD, maxD)
        .roundToDouble();
    final r = d / 2;
    var p = Offset.zero;
    for (
      var ang = next, rad = 4.0 * next;
      rad < 100000;
      ang += 8 / math.max(rad, 8)
    ) {
      rad = 4.0 * ang;
      p = Offset(cx + rad * math.cos(ang), rad * 0.6 * math.sin(ang));
      if (p.dx - r < 0 || p.dx + r > width) continue;
      final free = out.every((q) {
        final need = r + q.$3 / 2 + gap;
        final dx = p.dx - q.$2.dx;
        final dy = (p.dy - q.$2.dy).abs() * need / (need + label);
        return dx * dx + dy * dy >= need * need;
      });
      if (free) {
        if (reuseEqualWeightPrefix) next = ang + 8 / math.max(rad, 8);
        break;
      }
    }
    out.add((a, p, d));
  }
  var lo = double.infinity, hi = 0.0;
  for (final (_, c, d) in out) {
    lo = math.min(lo, c.dy - d / 2);
    hi = math.max(hi, c.dy + d / 2 + label);
  }
  final shifted = [for (final (a, c, d) in out) (a, c.translate(0, -lo), d)];
  return (shifted, out.isEmpty ? 0.0 : hi - lo);
}
