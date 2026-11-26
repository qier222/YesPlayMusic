import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../state.dart';

const _minD = 96.0, _maxD = 184.0, _label = 28.0, _gap = 18.0;

/// Places bubbles on the first free point of a spiral, allowing room for names.
(List<(LibraryArtist, Offset, double)>, double) layoutArtistCloud(
  List<LibraryArtist> artists,
  double width,
) {
  final top = artists.isEmpty ? 1 : math.max(1, artists.first.weight);
  final out = <(LibraryArtist, Offset, double)>[];
  final grid = _CollisionGrid();
  final spiral = _Spiral(width);
  var previousD = 0.0;
  var index = 0;
  var replayEnd = 0;
  for (final a in artists) {
    final d = (_minD + (_maxD - _minD) * math.sqrt(a.weight / top))
        .clamp(_minD, _maxD)
        .roundToDouble();
    final r = d / 2;
    // Earlier points still fail for the same diameter: bubbles are only added.
    if (d != previousD) {
      replayEnd = index;
      index = 0;
    }
    Offset? center;
    for (
      var point = spiral.at(index);
      point != null;
      point = spiral.at(++index)
    ) {
      if (point.blocked) continue;
      final p = point.center;
      if (p.dx - r < 0 || p.dx + r > width) continue;
      if (grid.isFree(point, r, replay: index < replayEnd)) {
        center = p;
        break;
      }
    }
    final p = center ?? spiral.last;
    grid.add(p, r);
    out.add((a, p, d));
    previousD = d;
  }
  var lo = double.infinity, hi = 0.0;
  for (final (_, c, d) in out) {
    lo = math.min(lo, c.dy - d / 2);
    hi = math.max(hi, c.dy + d / 2 + _label);
  }
  final shifted = [for (final (a, c, d) in out) (a, c.translate(0, -lo), d)];
  return (shifted, out.isEmpty ? 0.0 : hi - lo);
}

class _Spiral {
  _Spiral(this.width) : _cx = width / 2;

  final double width, _cx;
  final _points = <_SpiralPoint>[];
  double _ang = 0, _rad = 0;
  late final Offset last;

  _SpiralPoint? at(int index) {
    if (index < _points.length) return _points[index];
    if (_rad >= 100000) return null;
    do {
      final ang = _ang;
      _rad = 4.0 * ang;
      _ang += 8 / math.max(_rad, 8);
      final x = _cx + _rad * math.cos(ang);
      // Cache only points that can fit at least the smallest bubble.
      if (x - _minD / 2 >= 0 && x + _minD / 2 <= width) {
        final p = Offset(x, _rad * 0.6 * math.sin(ang));
        final point = _SpiralPoint(p);
        _points.add(point);
        if (_rad >= 100000) last = p;
        return point;
      }
      if (_rad >= 100000) last = Offset(x, _rad * 0.6 * math.sin(ang));
    } while (_rad < 100000);
    return null;
  }
}

class _SpiralPoint {
  _SpiralPoint(this.center);

  final Offset center;
  bool blocked = false;
}

class _CollisionGrid {
  // Larger than the maximum collision distance (_maxD + _gap + _label).
  static const _cellSize = 256.0;
  final _cells = <(int, int), List<(Offset, double)>>{};

  int _cell(double coordinate) => (coordinate / _cellSize).floor();

  void add(Offset p, double radius) {
    (_cells[(_cell(p.dx), _cell(p.dy))] ??= []).add((p, radius));
  }

  bool isFree(_SpiralPoint point, double radius, {required bool replay}) {
    final p = point.center;
    final cx = _cell(p.dx), cy = _cell(p.dy);
    for (var y = cy - 1; y <= cy + 1; y++) {
      for (var x = cx - 1; x <= cx + 1; x++) {
        final cell = _cells[(x, y)];
        if (cell == null) continue;
        for (final (q, otherRadius) in cell) {
          final dx = p.dx - q.dx;
          final dy = (p.dy - q.dy).abs();
          if (_overlaps(dx, dy, radius + otherRadius + _gap)) {
            // A point that cannot fit the smallest bubble never opens up.
            if (replay && _overlaps(dx, dy, _minD / 2 + otherRadius + _gap)) {
              point.blocked = true;
            }
            return false;
          }
        }
      }
    }
    return true;
  }

  bool _overlaps(double dx, double dy, double need) {
    final scaledDy = dy * need / (need + _label);
    return dx * dx + scaledDy * scaledDy < need * need;
  }
}
