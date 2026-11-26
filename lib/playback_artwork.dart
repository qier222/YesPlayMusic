import 'dart:io';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';

import 'cache/image_cache.dart';

const _maxOriginalBytes = 1024 * 1024;
const _maxArtworkEdge = 512;
const _pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

/// Loads a cover for Windows SMTC, reusing the player UI's disk cache.
Future<Uint8List> loadPlaybackArtwork(
  String cover, {
  @visibleForTesting int maxOriginalBytes = _maxOriginalBytes,
}) async {
  final uri = Uri.tryParse(cover);
  final Uint8List bytes;
  if (uri?.scheme == 'http' || uri?.scheme == 'https') {
    bytes = await ImageDiskCache.instance.bytes(cover);
  } else {
    final file = uri?.scheme == 'file' ? File.fromUri(uri!) : File(cover);
    bytes = await file.readAsBytes();
  }
  if (_isJpegOrPng(bytes) && bytes.length <= maxOriginalBytes) {
    return bytes;
  }
  final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
  try {
    final image = await ui.ImageDescriptor.encoded(buffer);
    try {
      return await _encodePng(image);
    } finally {
      image.dispose();
    }
  } finally {
    buffer.dispose();
  }
}

bool _isJpegOrPng(Uint8List bytes) =>
    (bytes.length >= 3 &&
        bytes[0] == 0xff &&
        bytes[1] == 0xd8 &&
        bytes[2] == 0xff) ||
    (bytes.length >= _pngSignature.length &&
        Iterable<int>.generate(_pngSignature.length)
            .every((i) => bytes[i] == _pngSignature[i]));

Future<Uint8List> _encodePng(ui.ImageDescriptor image) async {
  final scale = math.min(
    1.0,
    _maxArtworkEdge / math.max(image.width, image.height),
  );
  final codec = await image.instantiateCodec(
    targetWidth: math.max(1, (image.width * scale).round()),
    targetHeight: math.max(1, (image.height * scale).round()),
  );
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
