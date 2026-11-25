import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'cache/image_cache.dart';

/// Reads the current cover through the same disk cache as the player UI.
Future<Uint8List> loadPlaybackArtwork(String cover) async {
  final uri = Uri.tryParse(cover);
  final Uint8List bytes;
  if (uri?.scheme == 'http' || uri?.scheme == 'https') {
    bytes = await ImageDiskCache.instance.bytes(cover);
  } else {
    final file = uri?.scheme == 'file' ? File.fromUri(uri!) : File(cover);
    bytes = await file.readAsBytes();
  }
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length >= pngSignature.length &&
      Iterable<int>.generate(pngSignature.length)
          .every((i) => bytes[i] == pngSignature[i])) {
    return bytes;
  }
  final codec = await ui.instantiateImageCodec(bytes);
  try {
    final frame = await codec.getNextFrame();
    try {
      final png = await frame.image.toByteData(format: ui.ImageByteFormat.png);
      if (png == null) throw StateError('Could not encode cover as PNG');
      return png.buffer.asUint8List(png.offsetInBytes, png.lengthInBytes);
    } finally {
      frame.image.dispose();
    }
  } finally {
    codec.dispose();
  }
}
