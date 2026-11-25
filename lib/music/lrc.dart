// LRC lyrics parsing, normalising Lyrics into time-sorted LyricLines.
//
// Supports: several timestamps per line, [offset:±ms], enhanced LRC per-word timing <mm:ss.xx>,
// a separate translation LRC, and the same timestamp appearing twice (second line is the translation).

import 'package:flutter/foundation.dart';

import 'models.dart';

final _stamp = RegExp(r'\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]');
final _word = RegExp(r'<(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?>');
final _offset = RegExp(r'^\[offset:\s*([+-]?\d+)\s*\]', caseSensitive: false);

int _ms(Match m) {
  final frac = m.group(3) ?? '0';
  // .5 is 500ms, .05 is 50ms, .005 is 5ms.
  final fracMs = int.parse(frac.padRight(3, '0').substring(0, 3));
  return (int.parse(m.group(1)!) * 60 + int.parse(m.group(2)!)) * 1000 + fracMs;
}

/// Parses an LRC text into a sorted list of (time, text, words).
List<LyricLine> parseLrc(String lrc) {
  final rows = lrc.split(RegExp(r'\r?\n'));
  var offset = 0;
  for (final row in rows.reversed) {
    final off = _offset.firstMatch(row.trimLeft());
    if (off != null) {
      // An offset too large for an int counts as no offset.
      offset = int.tryParse(off.group(1)!) ?? 0;
      break;
    }
  }
  final out = <LyricLine>[];
  for (final raw in rows) {
    final line = raw.trim();
    final stamps = <int>[];
    var rest = line;
    while (true) {
      final m = _stamp.matchAsPrefix(rest);
      if (m == null) break;
      stamps.add(_ms(m));
      rest = rest.substring(m.end);
    }
    // Metadata like [ti:] or [ar:], or lines without a time
    if (stamps.isEmpty) continue;
    final (text, words) = _words(rest);
    for (final s in stamps) {
      // A positive offset makes lyrics appear earlier.
      final start = (s - offset).clamp(0, 1 << 31);
      out.add(
        LyricLine(start: start, text: text, words: _shift(words, -offset)),
      );
    }
  }
  // Stable sort, equal times keep their order
  out.sort((a, b) => a.start.compareTo(b.start));
  return out;
}

(String, List<LyricWord>) _words(String s) {
  final ms = _word.allMatches(s).toList();
  if (ms.isEmpty) return (s.trim(), const []);
  final words = <LyricWord>[];
  for (var i = 0; i < ms.length; i++) {
    final end = i + 1 < ms.length ? ms[i + 1].start : s.length;
    final text = s.substring(ms[i].end, end);
    // A trailing <time> only marks the end of the previous word
    if (text.isEmpty) continue;
    final next = i + 1 < ms.length ? _ms(ms[i + 1]) : 0;
    words.add(LyricWord(start: _ms(ms[i]), end: next, text: text));
  }
  return (words.map((w) => w.text).join().trim(), words);
}

List<LyricWord> _shift(List<LyricWord> ws, int d) => d == 0
    ? ws
    : [
        for (final w in ws)
          LyricWord(
            start: w.start + d,
            end: w.end == 0 ? 0 : w.end + d,
            text: w.text,
          ),
      ];

/// Normalises [Lyrics] into line-by-line lyrics: use lines if present; otherwise parse lrc and merge the translation.
/// Empty lines (bare timestamps, used for interludes) are kept so the UI can show interlude markers.
List<LyricLine> lyricLines(Lyrics l) {
  if (l.lines.isNotEmpty) return l.lines;
  var lines = parseLrc(l.lrc);

  // The same timestamp twice: common in LRC files that put the translation on the line below the original.
  final trans = <int, String>{};
  if (l.translation.isEmpty) {
    final merged = <LyricLine>[];
    for (final line in lines) {
      if (merged.isNotEmpty &&
          merged.last.start == line.start &&
          merged.last.text.isNotEmpty &&
          line.text.isNotEmpty &&
          !trans.containsKey(line.start)) {
        trans[line.start] = line.text;
        continue;
      }
      merged.add(line);
    }
    lines = merged;
  } else {
    for (final t in parseLrc(l.translation)) {
      if (t.text.isNotEmpty) trans[t.start] = t.text;
    }
  }

  return [
    for (var i = 0; i < lines.length; i++)
      LyricLine(
        start: lines[i].start,
        end: i + 1 < lines.length ? lines[i + 1].start : 0,
        text: lines[i].text,
        translation: trans[lines[i].start] ?? _near(trans, lines[i].start),
        words: lines[i].words,
      ),
  ];
}

/// Translation timestamps often differ from the original by tens of ms, so match the nearest.
String _near(Map<int, String> trans, int start) {
  for (final e in trans.entries) {
    if ((e.key - start).abs() <= 100) return e.value;
  }
  return '';
}

/// The line being sung at a given moment, or -1 if none.
@visibleForTesting
int lineAt(List<LyricLine> lines, int ms) {
  var lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) {
    final mid = (lo + hi) >> 1;
    if (lines[mid].start <= ms) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
