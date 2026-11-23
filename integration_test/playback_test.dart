// 在真机（macOS）上跑真实的 libmpv：flutter test integration_test -d macos
import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:path/path.dart' as p;
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
      await engine.open(await sources.stream(track));
      await done.future.timeout(const Duration(seconds: 10));
    })();

    expect(errors, isEmpty);
    expect(maxPos.inMilliseconds, greaterThan(1000));
  });
}
