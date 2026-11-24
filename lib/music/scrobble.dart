// Scrobbling: decides when a track counts as "started" and when it counts as
// "listened", and hands that to plugins that export nowPlaying / scrobble.
// The app only decides the timing and talks to no service itself; plugins
// connect to services such as Last.fm and ListenBrainz.
//
// The rules follow Last.fm's common convention: tracks shorter than 30 seconds
// don't count; a track counts once half of it or 4 minutes (whichever comes
// first) has actually been listened to. Time skipped by seeking doesn't count.

import 'dart:math' as math;

import 'models.dart';

class Scrobbler {
  Scrobbler({
    required this.onNowPlaying,
    required this.onScrobble,
    DateTime Function()? now,
  }) : _now = now ?? DateTime.now;

  /// A track started playing.
  final void Function(Track track) onNowPlaying;

  /// A track was listened to long enough. [startedAt] is when playback started,
  /// [playedMs] is how long it was actually listened to.
  final void Function(Track track, DateTime startedAt, int playedMs) onScrobble;

  final DateTime Function() _now;

  /// Tracks shorter than this (milliseconds) aren't scrobbled.
  static const minDurationMs = 30 * 1000;

  /// Listening this long (seconds) always counts, however long the track is.
  static const maxThreshold = 240.0;

  /// Seconds of a [durationMs] ms track that must be heard to count; null when
  /// the track isn't scrobbled.
  static double? thresholdOf(int durationMs) => durationMs < minDurationMs
      ? null
      : math.min(durationMs / 1000 / 2, maxThreshold);

  Track? _track;
  DateTime? _startedAt;
  double _last = 0, _played = 0;
  bool _done = false;

  /// Position (seconds) reported by the engine. When [playing] is false
  /// (paused) the position is only remembered.
  void position(Track t, double at, {required bool playing}) {
    if (_track?.key != t.key) {
      _track = t;
      _startedAt = null;
      _last = at;
      _played = 0;
      _done = false;
    }
    final d = at - _last;
    _last = at;
    if (!playing) return;
    if (_startedAt == null) {
      _startedAt = _now();
      onNowPlaying(t);
    }
    // Seeking jumps the position; only count steady forward progress
    if (d > 0 && d <= 2) _played += d;
    final need = thresholdOf(t.duration);
    if (!_done && need != null && _played >= need) {
      _done = true;
      onScrobble(t, _startedAt!, (_played * 1000).round());
    }
  }

  /// This play finished: playing the same track again counts as a new listen.
  void reset() => _track = null;
}
