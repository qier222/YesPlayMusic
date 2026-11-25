import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;

void main() {
  test('Track.copy returns a separate track with the same data', () {
    final ref = m.Track(id: '1', name: 'A', source: 'nosrc', duration: 1000);
    final t = Track(
      title: 'A',
      artist: 'B',
      cover: 'c.jpg',
      seconds: 1,
      album: 'D',
      mv: true,
      ref: ref,
      added: DateTime(2026, 1, 2),
    );
    final c = t.copy();
    expect(identical(c, t), isFalse);
    expect(c.title, t.title);
    expect(c.artist, t.artist);
    expect(c.cover, t.cover);
    expect(c.seconds, t.seconds);
    expect(c.album, t.album);
    expect(c.mv, t.mv);
    expect(identical(c.ref, ref), isTrue);
    expect(c.added, t.added);
  });

  test('Track.none.copy is not the const instance', () {
    expect(identical(Track.none.copy(), Track.none), isFalse);
  });
}
