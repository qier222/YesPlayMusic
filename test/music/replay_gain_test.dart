import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/replay_gain.dart';

void main() {
  test('智能模式：按专辑顺序时用专辑增益，否则用单曲增益', () {
    expect(mpvReplayGain(GainMode.smart, albumOrder: true), 'album');
    expect(mpvReplayGain(GainMode.smart, albumOrder: false), 'track');
    expect(mpvReplayGain(GainMode.off, albumOrder: true), 'no');
    expect(mpvReplayGain(GainMode.track, albumOrder: true), 'track');
    expect(mpvReplayGain(GainMode.album, albumOrder: false), 'album');
  });

  const s = AudioStream(
    url: 'file:///a.flac',
    type: 'flac',
    gain: -7,
    peak: 0.9,
    albumGain: -5,
    albumPeak: 0.95,
  );

  test('插件给的增益：关掉时为 0，专辑模式优先用专辑增益', () {
    expect(streamGainDb(s, 'no'), 0);
    expect(streamGainDb(s, 'track'), -7);
    expect(streamGainDb(s, 'album'), -5);
    // Falls back to track gain without album gain
    const t = AudioStream(url: 'x', type: 'mp3', gain: -4);
    expect(streamGainDb(t, 'album'), -4);
    // No data
    expect(streamGainDb(const AudioStream(url: 'x', type: 'mp3'), 'track'), 0);
  });

  test('提升时按峰值限制，不推到削波', () {
    const quiet = AudioStream(url: 'x', type: 'mp3', gain: 6, peak: 0.8);
    // A 0.8 peak leaves room for about 1.94 dB
    expect(streamGainDb(quiet, 'track'), closeTo(1.938, 0.01));
    const noPeak = AudioStream(url: 'x', type: 'mp3', gain: 6);
    expect(streamGainDb(noPeak, 'track'), 6);
  });
}
