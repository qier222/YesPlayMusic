import 'dart:typed_data';

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/cover_color.dart';

String hex(Color c) => '#${c.toARGB32().toRadixString(16).substring(2)}';

void main() {
  test('纯色像素：主色就是它本身', () {
    final px = Uint8List(4 * 100);
    for (var i = 0; i < 100; i++) {
      px.setAll(i * 4, [200, 30, 60, 255]);
    }
    final p = CoverPalette.fromPixels(px);
    expect(HSLColor.fromColor(p.dominant).hue, closeTo(345, 5));
    expect(p.onCard, const Color(0xFFFFFFFF));
  });

  test('黑白像素：不硬造色相', () {
    final px = Uint8List(4 * 100);
    for (var i = 0; i < 100; i++) {
      final v = i.isEven ? 20 : 220;
      px.setAll(i * 4, [v, v, v, 255]);
    }
    final p = CoverPalette.fromPixels(px);
    expect(HSLColor.fromColor(p.deep).saturation, 0);
  });

  test('粉红 / 品红像素 → 酒红系背景', () {
    final px = Uint8List(4 * 100);
    for (var i = 0; i < 100; i++) {
      px.setAll(i * 4, [230 - i, 80 + i ~/ 4, 160 + i ~/ 3, 255]);
    }
    final p = CoverPalette.fromPixels(px);
    final h = HSLColor.fromColor(p.deep).hue;
    expect(h > 300 || h < 20, isTrue, reason: '实际 ${hex(p.deep)}');
  });
}
