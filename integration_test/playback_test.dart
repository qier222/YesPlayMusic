// 在真机（macOS）上跑真实的 libmpv：flutter test integration_test -d macos
import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/eq.dart';
import 'package:yesplaymusic/music/local/local_source.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/player.dart';
import 'package:yesplaymusic/music/source.dart';

/// 440Hz 正弦波 WAV，音量很小。
void sineWav(String path, int ms) {
  const rate = 22050;
  final n = rate * ms ~/ 1000;
  final b = ByteData(44 + n * 2);
  void str(int o, String s) {
    for (var i = 0; i < s.length; i++) {
      b.setUint8(o + i, s.codeUnitAt(i));
    }
  }

  str(0, 'RIFF');
  b.setUint32(4, 36 + n * 2, Endian.little);
  str(8, 'WAVE');
  str(12, 'fmt ');
  b.setUint32(16, 16, Endian.little);
  b.setUint16(20, 1, Endian.little);
  b.setUint16(22, 1, Endian.little);
  b.setUint32(24, rate, Endian.little);
  b.setUint32(28, rate * 2, Endian.little);
  b.setUint16(32, 2, Endian.little);
  b.setUint16(34, 16, Endian.little);
  str(36, 'data');
  b.setUint32(40, n * 2, Endian.little);
  for (var i = 0; i < n; i++) {
    b.setInt16(
      44 + i * 2,
      (math.sin(2 * math.pi * 440 * i / rate) * 800).round(),
      Endian.little,
    );
  }
  File(path)
    ..parent.createSync(recursive: true)
    ..writeAsBytesSync(b.buffer.asUint8List());
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  AudioEngine.init();

  // 从本地源取到 file:// 地址，交给引擎真的播放：进度会前进，播完会触发 completed。
  // 路径里带中文和空格，确认 file:// 转本地路径没问题。
  // 不用 testWidgets：本机开着辅助功能时，它会因为系统的 SemanticsHandle 报错。
  test('plays a local file to the end', () async {
    final tmp = Directory.systemTemp.createTempSync('ypm_play_');
    addTearDown(() => tmp.deleteSync(recursive: true));
    sineWav(p.join(tmp.path, '音乐 文件夹', 'Tone - 测试.wav'), 1500);

    final src = LocalSource(
      folders: [tmp.path],
      cacheDir: p.join(tmp.path, 'c'),
    );
    await src.scan();
    final sources = Sources()..add(src);
    final track = (await src.search('测试', SearchKind.tracks)).tracks.single;

    final engine = AudioEngine();
    addTearDown(engine.dispose);
    var maxPos = Duration.zero;
    final done = Completer<void>();
    final errors = <String>[];
    engine.onPosition = (d) => maxPos = d > maxPos ? d : maxPos;
    engine.onCompleted = () => done.isCompleted ? null : done.complete();
    engine.onError = errors.add;

    await (() async {
      await engine.setVolume(0.2);
      await engine.open(await sources.stream(track), key: 'tone');
      await done.future.timeout(const Duration(seconds: 10));
    })();

    expect(errors, isEmpty);
    expect(maxPos.inMilliseconds, greaterThan(1000));
  });

  // Gapless: while the first track plays, queue the second in mpv; mpv moves on by
  // itself when the first ends and reports onAdvanced once, and completed only after
  // the whole list. The equalizer and ReplayGain are on too, to check that the
  // equalizer, af-command and per-file gain all work with the trimmed ffmpeg.
  test('gapless: queued track follows without reopening', () async {
    final tmp = Directory.systemTemp.createTempSync('ypm_gapless_');
    addTearDown(() => tmp.deleteSync(recursive: true));
    final a = p.join(tmp.path, 'a.wav'), b = p.join(tmp.path, 'b.wav');
    sineWav(a, 1500);
    sineWav(b, 1500);
    AudioStream wav(String path) =>
        AudioStream(url: Uri.file(path).toString(), type: 'wav');

    final engine = AudioEngine();
    addTearDown(engine.dispose);
    final advanced = <String>[];
    final errors = <String>[];
    final done = Completer<void>();
    // Read the gain once the second track starts (file-local: -3 for the first, -6 for the second)
    final gainB = Completer<String>();
    engine.onAdvanced = (k) {
      advanced.add(k);
      Future<void>.delayed(const Duration(milliseconds: 100)).then(
        (_) async =>
            gainB.complete(await engine.mpvProperty('replaygain-fallback')),
      );
    };
    var completed = 0;
    engine.onCompleted = () {
      completed++;
      if (!done.isCompleted) done.complete();
    };
    engine.onError = errors.add;

    await engine.setVolume(0.2);
    await engine.setEq(const EqSettings(enabled: true, preset: EqPreset.rock));
    await engine.open(wav(a), key: 'a', rg: 'track', gainDb: -3);
    await engine.queueNext(wav(b), key: 'b', rg: 'track', gainDb: -6);
    expect(engine.queuedKey, 'b');
    expect(await engine.mpvProperty('af'), contains('ypmeq9'));
    expect(double.parse(await engine.mpvProperty('replaygain-fallback')), -3);
    // Change the equalizer while playing: goes through af-command
    await engine.setEq(
      const EqSettings(
        enabled: true,
        preset: EqPreset.custom,
        custom: [3, 0, 0, 0, 0, 0, 0, 0, 0, -3],
      ),
    );
    await done.future.timeout(const Duration(seconds: 10));
    // Wait a bit more: completed must not fire a second time
    await Future<void>.delayed(const Duration(milliseconds: 500));

    expect(errors, isEmpty);
    expect(advanced, ['b']);
    expect(engine.queuedKey, isNull);
    expect(double.parse(await gainB.future), -6);
    // The end of the first track doesn't count as completed; only the end of the second does, once
    expect(completed, 1);
  });

  test('replays the last track after a gapless advance', () async {
    final tmp = Directory.systemTemp.createTempSync('ypm_replay_');
    addTearDown(() => tmp.deleteSync(recursive: true));
    final a = p.join(tmp.path, 'a.wav'), b = p.join(tmp.path, 'b.wav');
    sineWav(a, 1500);
    sineWav(b, 1500);
    AudioStream wav(String path) =>
        AudioStream(url: Uri.file(path).toString(), type: 'wav');

    final engine = AudioEngine();
    addTearDown(engine.dispose);
    final advanced = <String>[];
    final done = Completer<void>();
    engine.onAdvanced = advanced.add;
    engine.onCompleted = () {
      if (!done.isCompleted) done.complete();
    };

    await engine.open(wav(a), key: 'a');
    await engine.queueNext(wav(b), key: 'b');
    await done.future.timeout(const Duration(seconds: 10));
    expect(advanced, ['b']);
    expect(await engine.mpvProperty('path'), b);

    final replayed = Completer<void>();
    engine.onPosition = (position) {
      if (position > const Duration(milliseconds: 100) &&
          position < const Duration(milliseconds: 1000) &&
          !replayed.isCompleted) {
        replayed.complete();
      }
    };
    await engine.play();
    await replayed.future.timeout(const Duration(seconds: 10));
    expect(await engine.mpvProperty('path'), b);
    expect(advanced, ['b']);
  });
}
