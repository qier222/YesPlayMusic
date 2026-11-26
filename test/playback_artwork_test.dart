import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/playback_artwork.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late Directory temp;
  setUp(() async {
    temp = await Directory.systemTemp.createTemp('ypm_smtc_artwork_');
  });
  tearDown(() async {
    await temp.delete(recursive: true);
  });

  test('SMTC passes small JPEG and PNG covers through unchanged', () async {
    final jpeg = base64Decode(
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcg'
      'LikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYV'
      'FSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09P'
      'T09PT0//wAARCAACAAMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAU'
      'EAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABAf/xAAUEQEAAAA'
      'AAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCCAUkN/9k=',
    );
    final png = await File('assets/app_icon.png').readAsBytes();
    for (final bytes in [jpeg, png]) {
      final file = File.fromUri(temp.uri.resolve('cover'));
      await file.writeAsBytes(bytes);
      expect(await loadPlaybackArtwork(file.uri.toString()), bytes);
    }
  });

  test('SMTC converts oversized portraits and WebP to bounded PNGs', () async {
    final recorder = ui.PictureRecorder();
    ui.Canvas(recorder).drawColor(const ui.Color(0xff123456), ui.BlendMode.src);
    final picture = recorder.endRecording();
    final image = await picture.toImage(128, 1024);
    picture.dispose();
    final portrait = (await image.toByteData(format: ui.ImageByteFormat.png))!;
    image.dispose();
    final file = File.fromUri(temp.uri.resolve('portrait.png'));
    await file.writeAsBytes(
      portrait.buffer.asUint8List(
        portrait.offsetInBytes,
        portrait.lengthInBytes,
      ),
    );

    final webp = File.fromUri(temp.uri.resolve('cover.webp'));
    await webp.writeAsBytes(
      base64Decode(
        'UklGRjgAAABXRUJQVlA4ICwAAACQAQCdASoEAAMAAgA0JaACdLoAA5gA/vmTb/+QH'
        '/+QH/+QH/8gP+IXeyAwAA==',
      ),
    );
    for (final (path, width, height) in [
      (file.path, 64, 512),
      (webp.path, 4, 3),
    ]) {
      final bytes = await loadPlaybackArtwork(path);
      expect(bytes.take(8), [137, 80, 78, 71, 13, 10, 26, 10]);
      final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
      final output = await ui.ImageDescriptor.encoded(buffer);
      try {
        expect((output.width, output.height), (width, height));
      } finally {
        output.dispose();
        buffer.dispose();
      }
    }
  });
}
