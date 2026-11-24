// Volume normalization (ReplayGain).
//
// When the file has ReplayGain tags mpv reads them itself (replaygain=track|album);
// without tags (e.g. a stream transcoded by the server) the plugin's gain from
// AudioStream is passed to mpv as replaygain-fallback. Both are set per file
// (file-local), so with gapless playback the next track's gain applies when it starts.
//
// mpv's rule (compute_replaygain in player/audio.c): with replaygain on and tags
// in the file it uses the tags (plus replaygain-preamp, clipping prevented by
// default); otherwise it uses replaygain-fallback whenever that isn't 0. So the
// fallback must be 0 when normalization is off.

import 'dart:math' as math;

import 'models.dart';

enum GainMode {
  off,
  track,
  album,

  /// Album gain when an album plays in order; track gain otherwise (shuffle, playlists, radio).
  smart,
}

/// The replaygain value for mpv: no / track / album.
/// [albumOrder]: the queue comes from an album and shuffle is off.
String mpvReplayGain(GainMode mode, {required bool albumOrder}) =>
    switch (mode) {
      GainMode.off => 'no',
      GainMode.track => 'track',
      GainMode.album => 'album',
      GainMode.smart => albumOrder ? 'album' : 'track',
    };

/// The plugin's gain (dB), used when there are no tags; 0 when there's no usable data.
/// [rg] is the result of [mpvReplayGain]. Limited by the peak so the gain can't push it into clipping.
double streamGainDb(AudioStream s, String rg) {
  if (rg == 'no') return 0;
  final album = rg == 'album' && s.albumGain != 0;
  final gain = album ? s.albumGain : s.gain;
  if (gain == 0) return 0;
  final peak = album ? s.albumPeak : s.peak;
  if (peak <= 0) return gain;
  // Keep the peak after gain at most 1 (0 dBFS)
  return math.min(gain, -20 * math.log(peak) / math.ln10);
}
