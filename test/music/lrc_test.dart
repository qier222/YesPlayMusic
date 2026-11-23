import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/lrc.dart';
import 'package:yesplaymusic/music/models.dart';

void main() {
  // 一行多个时间戳会展开成多行，并按时间排序；.5 是 500ms 而不是 5ms。
  test('repeated stamps expand and sort, fractions scale', () {
    final ls = parseLrc(
      '[ti:Song]\n[00:10.5][00:01.05]chorus\n[00:05.123]verse',
    );
    expect(ls.map((l) => (l.start, l.text)), [
      (1050, 'chorus'),
      (5123, 'verse'),
      (10500, 'chorus'),
    ]);
  });

  // 正 offset 让歌词提前，但不会早于 0。
  test('offset shifts lines earlier and clamps at zero', () {
    final ls = parseLrc('[offset:+500]\n[00:00.20]a\n[00:02.00]b');
    expect(ls.map((l) => l.start), [0, 1500]);
  });

  // 增强 LRC 的逐字时间：每个字到下一个时间标记结束，文本是字拼起来。
  test('word timing from enhanced LRC', () {
    final l = parseLrc('[00:01.00]<00:01.00>Moon <00:01.50>river<00:02.00>')
        .single;
    expect(l.text, 'Moon river');
    expect(l.words.map((w) => (w.start, w.end, w.text)), [
      (1000, 1500, 'Moon '),
      (1500, 2000, 'river'),
    ]);
  });

  // 原文下一行用同一时间戳写翻译时，第二行并进上一行的 translation。
  test('same-stamp second line becomes translation', () {
    final ls = lyricLines(
      const Lyrics(
        lrc: '[00:01.00]Moon river\n[00:01.00]月亮河\n[00:04.00]Wider\n[00:04.00]更宽',
      ),
    );
    expect(ls.map((l) => (l.text, l.translation)), [
      ('Moon river', '月亮河'),
      ('Wider', '更宽'),
    ]);
    expect(ls.first.end, 4000);
  });

  // 单独的翻译 LRC 按时间对上原文，允许几十毫秒的误差。
  test('separate translation matches nearby stamps', () {
    final ls = lyricLines(
      const Lyrics(
        lrc: '[00:01.00]Moon river\n[00:04.00]Wider',
        translation: '[00:01.04]月亮河\n[00:09.00]不相干',
      ),
    );
    expect(ls.map((l) => l.translation), ['月亮河', '']);
  });

  // 插件直接给逐行歌词时，原样使用，不再解析 lrc。
  test('timed lines win over lrc', () {
    final ls = lyricLines(
      const Lyrics(
        lrc: '[00:01.00]ignored',
        lines: [LyricLine(start: 7, text: 'kept')],
      ),
    );
    expect(ls.single.text, 'kept');
  });

  // 二分查找当前行：第一行之前是 -1，正好在时间点上算这一行。
  test('lineAt finds the current line', () {
    final ls = parseLrc('[00:01.00]a\n[00:02.00]b\n[00:03.00]c');
    expect([0, 1000, 1999, 2000, 99999].map((t) => lineAt(ls, t)), [
      -1,
      0,
      0,
      1,
      2,
    ]);
  });
}
