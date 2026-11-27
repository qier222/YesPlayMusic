import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/mcp/playback_artwork.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late Directory temp;
  setUp(() async {
    temp = await Directory.systemTemp.createTemp('ypm_mcp_artwork_');
  });
  tearDown(() async {
    await temp.delete(recursive: true);
  });

  Future<File> writeSolidPortraitPng(String name) async {
    final recorder = ui.PictureRecorder();
    ui.Canvas(recorder).drawColor(const ui.Color(0xff123456), ui.BlendMode.src);
    final picture = recorder.endRecording();
    final image = await picture.toImage(128, 1024);
    picture.dispose();
    final portrait = (await image.toByteData(format: ui.ImageByteFormat.png))!;
    image.dispose();
    final file = File.fromUri(temp.uri.resolve(name));
    await file.writeAsBytes(
      portrait.buffer.asUint8List(
        portrait.offsetInBytes,
        portrait.lengthInBytes,
      ),
    );
    return file;
  }

  Future<File> writeNoisyPortraitPng(String name) async {
    const width = 128;
    const height = 1024;
    final pixels = Uint8List(width * height * 4);
    var seed = 0x12345678;
    for (var i = 0; i < pixels.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      pixels[i] = seed & 0xff;
      pixels[i + 1] = (seed >> 8) & 0xff;
      pixels[i + 2] = (seed >> 16) & 0xff;
      pixels[i + 3] = 0xff;
    }
    final completer = Completer<ui.Image>();
    ui.decodeImageFromPixels(
      pixels,
      width,
      height,
      ui.PixelFormat.rgba8888,
      completer.complete,
    );
    final image = await completer.future;
    final data = (await image.toByteData(format: ui.ImageByteFormat.png))!;
    image.dispose();
    final file = File.fromUri(temp.uri.resolve(name));
    await file.writeAsBytes(
      data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes),
    );
    return file;
  }

  Future<(int, int)> imageDimensions(Uint8List bytes) async {
    final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
    try {
      final image = await ui.ImageDescriptor.encoded(buffer);
      try {
        return (image.width, image.height);
      } finally {
        image.dispose();
      }
    } finally {
      buffer.dispose();
    }
  }

  final jpeg = base64Decode(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcg'
    'LikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYV'
    'FSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09P'
    'T09PT0//wAARCAACAAMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAU'
    'EAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABAf/xAAUEQEAAAA'
    'AAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCCAUkN/9k=',
  );

  // 1x1 lossless WebP
  final webp = base64Decode(
    'UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
  );

  test('passes through JPEG and PNG covers within maxBytes even when larger than 512px', () async {
    final png = await File('assets/app_icon.png').readAsBytes();
    final portrait = await (await writeSolidPortraitPng('portrait.png'))
        .readAsBytes();
    expect(await imageDimensions(portrait), (128, 1024));
    for (final (bytes, mimeType) in [
      (jpeg, 'image/jpeg'),
      (png, 'image/png'),
      (portrait, 'image/png'),
    ]) {
      final file = File.fromUri(temp.uri.resolve('cover'));
      await file.writeAsBytes(bytes);
      final thumbnail = await loadMcpArtwork(file.path);
      expect(thumbnail?.mimeType, mimeType);
      expect(thumbnail?.bytes, bytes);
    }
  });

  test('transcodes WebP covers to PNG', () async {
    final file = File.fromUri(temp.uri.resolve('cover.webp'));
    await file.writeAsBytes(webp);
    final thumbnail = (await loadMcpArtwork(file.path))!;
    expect(thumbnail.mimeType, 'image/png');
    expect(await imageDimensions(thumbnail.bytes), (1, 1));
  });

  test('scales oversized covers to 512px PNG, falls back to 256px PNG, then returns null', () async {
    final portrait = await writeNoisyPortraitPng('noisy.png');
    final originalSize = await portrait.length();

    // Exceeds maxBytes: scales down to 512px PNG.
    final png512 = (await loadMcpArtwork(
      portrait.path,
      maxBytes: originalSize - 1,
    ))!;
    expect(png512.mimeType, 'image/png');
    expect(png512.bytes.length, lessThan(originalSize));
    expect(await imageDimensions(png512.bytes), (64, 512));

    // 512px PNG still exceeds maxBytes: falls back to 256px PNG.
    final png256 = (await loadMcpArtwork(
      portrait.path,
      maxBytes: png512.bytes.length - 1,
    ))!;
    expect(png256.mimeType, 'image/png');
    expect(png256.bytes.length, lessThan(png512.bytes.length));
    expect(await imageDimensions(png256.bytes), (32, 256));

    // 256px PNG also exceeds maxBytes: returns null.
    expect(
      await loadMcpArtwork(portrait.path, maxBytes: png256.bytes.length - 1),
      isNull,
    );
  });
}
