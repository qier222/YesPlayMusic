import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/local/local_source.dart';
import 'package:yesplaymusic/music/local/mp3_info.dart';
import 'package:yesplaymusic/music/models.dart';

/// Writes an MP3 laid out like ffmpeg/libmp3lame output: an ID3v2.3 tag, then
/// a first frame with [header] whose side info is followed by a [tag] ("Info",
/// "Xing" or none) carrying [frames], then zeroed audio up to [audioBytes].
///
/// The default header `ff fb 40 c0` is MPEG-1 Layer III, 56 kb/s, 44.1 kHz,
/// mono: the header frame libmp3lame writes for a 64 kb/s CBR mono stream.
File mp3(
  String path, {
  String? tag = 'Info',
  int frames = 920,
  int flags = 0x0F,
  List<int> header = const [0xFF, 0xFB, 0x40, 0xC0],
  int sideInfo = 17,
  int audioBytes = 192443,
}) {
  final audio = Uint8List(audioBytes)..setAll(0, header);
  if (tag != null) {
    final at = 4 + sideInfo;
    audio.setAll(at, tag.codeUnits);
    ByteData.sublistView(audio)
      ..setUint32(at + 4, flags)
      ..setUint32(at + 8, frames);
  }
  final id3 = [0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 20, ...List.filled(20, 0)];
  final f = File(path)..parent.createSync(recursive: true);
  f.writeAsBytesSync([...id3, ...audio]);
  return f;
}

void main() {
  late Directory tmp;
  setUp(() => tmp = Directory.systemTemp.createTempSync('ypm_mp3_'));
  tearDown(() => tmp.deleteSync(recursive: true));

  String at(String name) => p.join(tmp.path, 'Music', name);

  Future<Map<String, int>> scannedDurations() async {
    final src = LocalSource(
      folders: [p.join(tmp.path, 'Music')],
      cacheDir: p.join(tmp.path, 'cache'),
    );
    await src.scan();
    final r = await src.search('track', SearchKind.tracks);
    return {for (final t in r.tracks) t.name: t.duration};
  }

  // 920 frames × 1152 samples / 44100 Hz = 24.032 s, as ffprobe reports.
  test('scan uses the Info frame count for CBR MP3s', () async {
    mp3(at('track info.mp3'));
    expect(await scannedDurations(), {'track info': 24032});
  });

  test('scan keeps the Xing and headerless durations', () async {
    mp3(at('track xing.mp3'), tag: 'Xing');
    // No header frame: the first frame is a 64 kb/s audio frame.
    mp3(at('track plain.mp3'), tag: null, header: [0xFF, 0xFB, 0x50, 0xC4]);
    expect(await scannedDurations(), {
      'track xing': 24032,
      'track plain': 192443 * 8 ~/ 64,
    });
  });

  test('reads Info headers of MPEG-2 stereo files', () {
    // MPEG-2 Layer III, 32 kb/s, 22.05 kHz, stereo: 17 bytes of side info and
    // 576 samples per frame.
    final f = mp3(
      at('mpeg2.mp3'),
      header: [0xFF, 0xF3, 0x40, 0x00],
      frames: 1000,
    );
    expect(
      infoHeaderDuration(f),
      const Duration(microseconds: 1000 * 576 * 1000000 ~/ 22050),
    );
  });

  test('skips an ID3v2.4 footer', () {
    final f = mp3(at('footer.mp3'));
    final b = f.readAsBytesSync();
    b[3] = 4;
    b[5] = 0x10;
    // The footer is ten bytes after the tag, so the frame starts 10 bytes later.
    f.writeAsBytesSync([
      ...b.sublist(0, 30),
      ...List.filled(10, 0),
      ...b.sublist(30),
    ]);
    expect(infoHeaderDuration(f), const Duration(microseconds: 24032653));
  });

  test('ignores missing, truncated and malformed headers', () {
    expect(infoHeaderDuration(File(at('missing.mp3'))), isNull);
    expect(infoHeaderDuration(mp3(at('xing.mp3'), tag: 'Xing')), isNull);
    expect(infoHeaderDuration(mp3(at('none.mp3'), tag: null)), isNull);
    expect(infoHeaderDuration(mp3(at('noframes.mp3'), flags: 0x0E)), isNull);
    expect(infoHeaderDuration(mp3(at('zero.mp3'), frames: 0)), isNull);
    final short = mp3(at('short.mp3'));
    short.writeAsBytesSync(short.readAsBytesSync().sublist(0, 30 + 24));
    expect(infoHeaderDuration(short), isNull);
    expect(
      infoHeaderDuration(
        mp3(at('layer2.mp3'), header: [0xFF, 0xFD, 0x40, 0xC0]),
      ),
      isNull,
    );
    expect(
      infoHeaderDuration(
        mp3(at('badrate.mp3'), header: [0xFF, 0xFB, 0x4C, 0xC0]),
      ),
      isNull,
    );
    final junk = File(at('junk.mp3'))..writeAsBytesSync([0x49, 0x44, 0x33, 3]);
    expect(infoHeaderDuration(junk), isNull);
  });
}
