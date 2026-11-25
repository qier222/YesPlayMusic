import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/lrc.dart';
import 'package:yesplaymusic/music/models.dart';

void main() {
  // Several timestamps on one line expand into several lines sorted by time; .5 is 500ms, not 5ms.
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

  // A positive offset makes lyrics earlier, but never before 0.
  test('offset shifts lines earlier and clamps at zero', () {
    final ls = parseLrc('[offset:+500]\n[00:00.20]a\n[00:02.00]b');
    expect(ls.map((l) => l.start), [0, 1500]);
  });

  test('trailing offset shifts all line and word timestamps', () {
    final ls = parseLrc(
      '[00:00.20]Intro\n'
      '[00:02.00]<00:02.00>Moon <00:02.50>river<00:03.00>\n'
      '[offset:+500]',
    );
    expect(
      [ls.map((l) => l.start), ls.last.words.map((w) => (w.start, w.end))],
      [
        [0, 1500],
        [(1500, 2000), (2000, 2500)],
      ],
    );
  });

  test('oversized offset is ignored and lines stay unshifted', () {
    final ls = parseLrc(
      '[offset:+500]\n[offset:99999999999999999999]\n[00:01.00]a\n[00:02.00]b',
    );
    expect(ls.map((l) => l.start), [1000, 2000]);
  });

  // Enhanced LRC per-word timing: each word ends at the next time tag, and the text is the words joined.
  test('word timing from enhanced LRC', () {
    final l = parseLrc('[00:01.00]<00:01.00>Moon <00:01.50>river<00:02.00>')
        .single;
    expect(l.text, 'Moon river');
    expect(l.words.map((w) => (w.start, w.end, w.text)), [
      (1000, 1500, 'Moon '),
      (1500, 2000, 'river'),
    ]);
  });

  // When the translation is on the next line with the same timestamp, the second line merges into the previous line's translation.
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

  test('same-stamp lines keep file order in longer lyrics', () {
    final rows = [
      for (var i = 1; i <= 20; i++) ...[
        '[00:${i.toString().padLeft(2, '0')}.00]Original line $i',
        '[00:${i.toString().padLeft(2, '0')}.00]Translation $i',
      ],
    ];
    final lines = lyricLines(Lyrics(lrc: rows.join('\n')));

    expect(lines.map((l) => (l.start, l.text, l.translation)), [
      for (var i = 1; i <= 20; i++)
        (i * 1000, 'Original line $i', 'Translation $i'),
    ]);
  });

  // A separate translation LRC is matched to the original by time, allowing tens of ms of error.
  test('separate translation matches nearby stamps', () {
    final ls = lyricLines(
      const Lyrics(
        lrc: '[00:01.00]Moon river\n[00:04.00]Wider',
        translation: '[00:01.04]月亮河\n[00:09.00]不相干',
      ),
    );
    expect(ls.map((l) => l.translation), ['月亮河', '']);
  });

  test('separate translation picks the closest stamp within 100 ms', () {
    final ls = lyricLines(
      const Lyrics(
        lrc:
            '[00:01.10]Closest\n'
            '[00:02.10]Tie\n'
            '[00:03.10]Exact\n'
            '[00:04.10]At the limit\n'
            '[00:05.10]Outside the limit',
        translation:
            '[00:01.12]Closest translation\n'
            '[00:01.02]Earlier but farther translation\n'
            '[00:02.15]Later tied translation\n'
            '[00:02.05]Earlier tied translation\n'
            '[00:03.05]Nearby translation\n'
            '[00:03.10]Exact translation\n'
            '[00:04.00]Boundary translation\n'
            '[00:05.201]Too far',
      ),
    );
    expect(ls.map((l) => l.translation), [
      'Closest translation',
      'Earlier tied translation',
      'Exact translation',
      'Boundary translation',
      '',
    ]);
  });

  test('same-stamp translations also supply the closest nearby cue', () {
    final ls = lyricLines(
      const Lyrics(
        lrc:
            '[00:01.02]Earlier line\n[00:01.02]Earlier translation\n'
            '[00:01.10]Line without exact translation\n'
            '[00:01.12]Later line\n[00:01.12]Later translation',
      ),
    );
    expect(ls.map((l) => l.translation), [
      'Earlier translation',
      'Later translation',
      'Later translation',
    ]);
  });

  // When a plugin gives line-by-line lyrics directly, they're used as-is without parsing lrc.
  test('timed lines win over lrc', () {
    final ls = lyricLines(
      const Lyrics(
        lrc: '[00:01.00]ignored',
        lines: [LyricLine(start: 7, text: 'kept')],
      ),
    );
    expect(ls.single.text, 'kept');
  });

  // Binary search for the current line: -1 before the first line; exactly on a timestamp counts as that line.
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
