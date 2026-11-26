import 'dart:convert';
import 'dart:io';
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

  Future<File> writePortraitPng(String name) async {
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

  final jpeg = base64Decode(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcg'
    'LikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYV'
    'FSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09P'
    'T09PT0//wAARCAACAAMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAU'
    'EAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABAf/xAAUEQEAAAA'
    'AAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCCAUkN/9k=',
  );

  test('thumbnails preserve the MIME type and bytes of small covers', () async {
    final png = await File('assets/app_icon.png').readAsBytes();
    for (final (bytes, mimeType) in [
      (jpeg, 'image/jpeg'),
      (png, 'image/png'),
    ]) {
      final file = File.fromUri(temp.uri.resolve('cover'));
      await file.writeAsBytes(bytes);
      final thumbnail = await loadMcpArtwork(file.path);
      expect(thumbnail?.mimeType, mimeType);
      expect(thumbnail?.bytes, bytes);
    }
  });

  test('thumbnails enforce both the dimension and byte limit', () async {
    final portrait = await writePortraitPng('thumbnail.png');
    const maxBytes = 512 * 1024;
    expect(await portrait.length(), lessThan(maxBytes));
    final thumbnail = (await loadMcpArtwork(portrait.path))!;
    expect(thumbnail.mimeType, 'image/png');
    expect(thumbnail.bytes.length, lessThanOrEqualTo(maxBytes));
    final buffer = await ui.ImmutableBuffer.fromUint8List(thumbnail.bytes);
    try {
      final image = await ui.ImageDescriptor.encoded(buffer);
      try {
        expect((image.width, image.height), (64, 512));
      } finally {
        image.dispose();
      }
    } finally {
      buffer.dispose();
    }
    expect(await loadMcpArtwork(portrait.path, maxBytes: 1), isNull);
  });
}
