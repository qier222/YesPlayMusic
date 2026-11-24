import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/eq.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/replay_gain.dart';
import 'package:yesplaymusic/state.dart';

/// A track with no matching source: _sync fails to get a URL and never creates an engine.
Track _t(String id) => Track.of(
  m.Track(id: id, name: 'Song $id', source: 'nosrc', duration: 180000),
);

Future<void> _settle() =>
    Future<void>.delayed(const Duration(milliseconds: 350));

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  setUp(() {
    app = AppState();
    app.clearQueue();
    app.setSleepTimer(null);
  });
  tearDown(() async {
    await _settle();
    app.dispose();
  });

  test('睡眠定时：按时间 / 放完这首，互相替换，可以关掉', () {
    app.setSleepTimer(const Duration(minutes: 30));
    expect(app.sleepOn, isTrue);
    expect(app.sleepAfterTrack, isFalse);
    expect(app.sleepLeft!.inMinutes, inInclusiveRange(29, 30));

    app.setSleepAfterTrack();
    expect(app.sleepAfterTrack, isTrue);
    expect(app.sleepAt, isNull);
    expect(app.sleepLeft, isNull);

    app.setSleepTimer(null);
    expect(app.sleepOn, isFalse);
  });

  test('睡眠定时：到点暂停并自动关掉', () async {
    app.playList([_t('1'), _t('2')]);
    await _settle();
    app.playing = true; // No real engine: just treat it as playing
    app.setSleepTimer(const Duration(milliseconds: 300));
    await Future<void>.delayed(const Duration(milliseconds: 700));
    expect(app.playing, isFalse);
    expect(app.sleepOn, isFalse);
  });

  test('渐弱：最后 20 秒从 1 减到 0', () {
    expect(AppState.sleepFadeAt(const Duration(minutes: 5)), 1);
    expect(AppState.sleepFadeAt(AppState.sleepFade), 1);
    expect(
      AppState.sleepFadeAt(const Duration(seconds: 10)),
      closeTo(0.25, 1e-9),
    );
    expect(AppState.sleepFadeAt(Duration.zero), 0);
  });

  test('next(play: false)：换到下一首但不开始放', () async {
    app.playList([_t('1'), _t('2'), _t('3')]);
    await _settle();
    app.next(play: false);
    expect(app.index, 1);
    expect(app.playing, isFalse);
  });

  test('音量均衡和均衡器的设置会记住', () async {
    app.setGainMode(GainMode.smart);
    app.setEq(const EqSettings(enabled: true, preset: EqPreset.vocal));
    app.dispose(); // Unsaved equalizer settings are written on exit
    app = AppState();
    expect(app.gainMode, GainMode.smart);
    expect(app.eq.enabled, isTrue);
    expect(app.eq.preset, EqPreset.vocal);
    app.setGainMode(GainMode.off);
    app.setEq(const EqSettings());
  });
}
