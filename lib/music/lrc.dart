// LRC 歌词解析，把 Lyrics 统一成按时间排序的 LyricLine。
//
// 支持：一行多个时间戳、[offset:±ms]、增强 LRC 的逐字时间 <mm:ss.xx>、
// 单独的翻译 LRC，以及同一时间戳出现两次（第二行当翻译）的写法。

import 'package:flutter/foundation.dart';

import 'models.dart';

final _stamp = RegExp(r'\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]');
final _word = RegExp(r'<(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?>');
final _offset = RegExp(r'^\[offset:\s*([+-]?\d+)\s*\]', caseSensitive: false);

int _ms(Match m) {
  final frac = m.group(3) ?? '0';
  // .5 是 500ms，.05 是 50ms，.005 是 5ms。
  final fracMs = int.parse(frac.padRight(3, '0').substring(0, 3));
  return (int.parse(m.group(1)!) * 60 + int.parse(m.group(2)!)) * 1000 + fracMs;
}

/// 解析一段 LRC，得到 (时间, 文本, 逐字) 的列表，已排序。
List<LyricLine> parseLrc(String lrc) {
  var offset = 0;
  final out = <LyricLine>[];
  for (final raw in lrc.split(RegExp(r'\r?\n'))) {
    final line = raw.trim();
    final off = _offset.firstMatch(line);
    if (off != null) {
      offset = int.parse(off.group(1)!);
      continue;
    }
    final stamps = <int>[];
    var rest = line;
    while (true) {
      final m = _stamp.matchAsPrefix(rest);
      if (m == null) break;
      stamps.add(_ms(m));
      rest = rest.substring(m.end);
    }
    if (stamps.isEmpty) continue; // [ti:]、[ar:] 之类的元信息，或无时间的行
    final (text, words) = _words(rest);
    for (final s in stamps) {
      // 正 offset 表示歌词提前出现。
      final start = (s - offset).clamp(0, 1 << 31);
      out.add(
        LyricLine(start: start, text: text, words: _shift(words, -offset)),
      );
    }
  }
  out.sort((a, b) => a.start.compareTo(b.start)); // 稳定排序，同时间保持原顺序
  return out;
}

(String, List<LyricWord>) _words(String s) {
  final ms = _word.allMatches(s).toList();
  if (ms.isEmpty) return (s.trim(), const []);
  final words = <LyricWord>[];
  for (var i = 0; i < ms.length; i++) {
    final end = i + 1 < ms.length ? ms[i + 1].start : s.length;
    final text = s.substring(ms[i].end, end);
    if (text.isEmpty) continue; // 末尾的 <时间> 只标记上一个字的结束
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

/// 把 [Lyrics] 统一成逐行歌词：有 lines 直接用；否则解析 lrc，并合上翻译。
/// 空行（纯时间戳、用于间奏）保留，界面可以据此显示间奏点。
List<LyricLine> lyricLines(Lyrics l) {
  if (l.lines.isNotEmpty) return l.lines;
  var lines = parseLrc(l.lrc);

  // 同一时间戳出现两次：常见于把翻译直接写在原文下一行的 LRC。
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

/// 翻译时间戳和原文常有几十毫秒误差，就近匹配。
String _near(Map<int, String> trans, int start) {
  for (final e in trans.entries) {
    if ((e.key - start).abs() <= 100) return e.value;
  }
  return '';
}

/// 某一时刻正在唱的那一行，没有则 -1。
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
