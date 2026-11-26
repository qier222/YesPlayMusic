// Duration of CBR MP3s from their LAME "Info" header.
//
// LAME and ffmpeg write a frame-count header into the first frame of every MP3:
// "Xing" for VBR files and "Info" for CBR files, with the same layout.
// audio_metadata_reader 1.8.1 only recognises "Xing"; for "Info" files it
// divides the audio size by the header frame's own bitrate, which can be lower
// than the stream's (a 64 kb/s file whose header frame is 56 kb/s reads 14% long).

import 'dart:io';
import 'dart:typed_data';

/// The stream duration from [file]'s "Info" header, or null when the file has
/// none (no frame count, a "Xing" header, or not a readable MPEG Layer III file).
Duration? infoHeaderDuration(File file) {
  try {
    final raf = file.openSync();
    try {
      return _read(raf);
    } finally {
      raf.closeSync();
    }
  } on FileSystemException {
    return null;
  }
}

Duration? _read(RandomAccessFile raf) {
  var offset = 0;
  // Skip ID3v2 tags (there may be more than one) to reach the first frame.
  while (true) {
    raf.setPositionSync(offset);
    final h = raf.readSync(10);
    if (h.length < 10 || h[0] != 0x49 || h[1] != 0x44 || h[2] != 0x33) break;
    if ((h[6] | h[7] | h[8] | h[9]) & 0x80 != 0) return null;
    final size = h[6] << 21 | h[7] << 14 | h[8] << 7 | h[9];
    final footer = h[3] == 4 && h[5] & 0x10 != 0;
    offset += 10 + size + (footer ? 10 : 0);
  }

  raf.setPositionSync(offset);
  // Frame header (4) + side info (at most 32) + "Info" + flags + frame count.
  final b = raf.readSync(4 + 32 + 12);
  if (b.length < 4 || b[0] != 0xFF || b[1] & 0xE0 != 0xE0) return null;

  // Version bits: 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5, 1 is reserved.
  final version = b[1] >> 3 & 0x3;
  final layer3 = b[1] >> 1 & 0x3 == 1;
  final bitrateIndex = b[2] >> 4;
  final rateIndex = b[2] >> 2 & 0x3;
  if (version == 1 || !layer3 || bitrateIndex == 0 || bitrateIndex == 15) {
    return null;
  }
  if (rateIndex == 3) return null;

  final mpeg1 = version == 3;
  final mono = b[3] >> 6 == 3;
  final sampleRate =
      const [44100, 48000, 32000][rateIndex] >>
      (mpeg1 ? 0 : (version == 2 ? 1 : 2));
  final samplesPerFrame = mpeg1 ? 1152 : 576;
  final sideInfo = mpeg1 ? (mono ? 17 : 32) : (mono ? 9 : 17);

  final at = 4 + sideInfo;
  if (b.length < at + 12) return null;
  final tag = String.fromCharCodes(b, at, at + 4);
  final framesFlag = b[at + 7] & 0x1 != 0;
  if (tag != 'Info' || !framesFlag) return null;

  final frames = ByteData.sublistView(b, at + 8, at + 12).getUint32(0);
  if (frames == 0) return null;
  return Duration(
    microseconds: frames * samplesPerFrame * 1000000 ~/ sampleRate,
  );
}
