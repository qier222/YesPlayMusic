import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;

import '../cache/image_cache.dart';

const _maxArtworkEdge = 512;
const _fallbackArtworkEdge = 256;
const _pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

typedef McpArtwork = ({Uint8List bytes, String mimeType});

/// Loads an MCP cover thumbnail with a limit on its encoded image bytes.
Future<McpArtwork?> loadMcpArtwork(
  String cover, {
  int maxBytes = 512 * 1024,
}) async {
  final bytes = await _readArtwork(cover);
  final mimeType = _originalMimeType(bytes);
  if (mimeType != null && bytes.length <= maxBytes) {
    return (bytes: bytes, mimeType: mimeType);
  }
  final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
  try {
    final image = await ui.ImageDescriptor.encoded(buffer);
    try {
      for (final maxEdge in const [_maxArtworkEdge, _fallbackArtworkEdge]) {
        final png = await _encodePng(image, maxEdge: maxEdge);
        if (png.length <= maxBytes) {
          return (bytes: png, mimeType: 'image/png');
        }
      }
      return null;
    } finally {
      image.dispose();
    }
  } finally {
    buffer.dispose();
  }
}

Future<Uint8List> _readArtwork(String cover) {
  final uri = Uri.tryParse(cover);
  if (uri?.scheme == 'http' || uri?.scheme == 'https') {
    return ImageDiskCache.instance.bytes(cover);
  }
  final file = uri?.scheme == 'file' ? File.fromUri(uri!) : File(cover);
  return file.readAsBytes();
}

String? _originalMimeType(Uint8List bytes) {
  if (bytes.length >= 3 &&
      bytes[0] == 0xff &&
      bytes[1] == 0xd8 &&
      bytes[2] == 0xff) {
    return 'image/jpeg';
  }
  if (bytes.length >= _pngSignature.length &&
      Iterable<int>.generate(_pngSignature.length)
          .every((i) => bytes[i] == _pngSignature[i])) {
    return 'image/png';
  }
  return null;
}

Future<Uint8List> _encodePng(
  ui.ImageDescriptor image, {
  required int maxEdge,
}) async {
  final scale = math.min(1.0, maxEdge / math.max(image.width, image.height));
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
