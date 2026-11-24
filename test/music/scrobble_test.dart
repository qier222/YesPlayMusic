import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/scrobble.dart';

void main() {
  late List<String> log;
  late Scrobbler s;
  final t0 = DateTime.utc(2026, 11, 24, 8);
  var clock = t0;

  setUp(() {
    log = [];
    clock = t0;
    s = Scrobbler(
      onNowPlaying: (t) => log.add('now ${t.id}'),
      onScrobble: (t, at, ms) =>
          log.add('scrobble ${t.id} ${at.difference(t0).inSeconds} $ms'),
      now: () => clock,
    );
  });

  Track song(String id, int seconds) =>
      Track(id: id, name: id, source: 'x', duration: seconds * 1000);

  /// Plays from [from] to [to] seconds, reporting every 0.5 seconds.
  void play(Track t, double from, double to, {bool playing = true}) {
    for (var v = from; v <= to; v += 0.5) {
      s.position(t, v, playing: playing);
    }
  }

  test('threshold: none under 30 s, else half or 4 minutes', () {
    expect(Scrobbler.thresholdOf(29 * 1000), isNull);
    expect(Scrobbler.thresholdOf(0), isNull);
    expect(Scrobbler.thresholdOf(60 * 1000), 30);
    expect(Scrobbler.thresholdOf(20 * 60 * 1000), 240);
  });

  test('nowPlaying once on start, scrobble once at half', () {
    final a = song('a', 100);
    play(a, 0, 49);
    expect(log, ['now a']);
    play(a, 49.5, 100);
    expect(log, ['now a', 'scrobble a 0 50000']);
  });

  test('time skipped by seeking does not count', () {
    final a = song('a', 100);
    play(a, 0, 10);
    play(a, 90, 100); // seek to 90 s and finish: only 20 s heard
    expect(log, ['now a']);
  });

  test('paused time does not count; start time is when playback began', () {
    final a = song('a', 100);
    play(a, 20, 20, playing: false); // restored at launch to 20 s, paused
    expect(log, isEmpty);
    clock = t0.add(const Duration(minutes: 5));
    play(a, 20, 80);
    expect(log, ['now a', 'scrobble a 300 50000']);
  });

  test(
    'short tracks are not scrobbled; a new track or a replay counts again',
    () {
      final short = song('s', 20);
      play(short, 0, 20);
      expect(log, ['now s']);
      final a = song('a', 60);
      play(a, 0, 60);
      s.reset();
      play(a, 0, 60);
      expect(log, [
        'now s',
        'now a',
        'scrobble a 0 30000',
        'now a',
        'scrobble a 0 30000',
      ]);
    },
  );
}
