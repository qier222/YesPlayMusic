import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/local/local_source.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/source.dart';

/// Writes a silent WAV [ms] milliseconds long (8kHz mono 16-bit), with [info] as RIFF LIST/INFO
/// tags (INAM title, IART artist, IPRD album, ITRK track number, ICRD date).
/// The tag library can only rewrite existing INFO chunks, not create them, so bytes are written directly here.
File wav(String path, {int ms = 1000, Map<String, String> info = const {}}) {
  const rate = 8000;
  final b = BytesBuilder();
  void u32(int v) =>
      b.add((ByteData(4)..setUint32(0, v, Endian.little)).buffer.asUint8List());
  void u16(int v) =>
      b.add((ByteData(2)..setUint16(0, v, Endian.little)).buffer.asUint8List());

  final list = BytesBuilder()..add('INFO'.codeUnits);
  for (final e in info.entries) {
    final v = [...e.value.codeUnits, 0];
    list.add(e.key.codeUnits);
    list.add(
      (ByteData(4)..setUint32(0, v.length, Endian.little)).buffer.asUint8List(),
    );
    list.add(v);
    if (v.length.isOdd) list.addByte(0);
  }
  final listBytes = list.takeBytes();
  final data = rate * ms ~/ 1000 * 2;

  b.add('RIFF'.codeUnits);
  u32(4 + (8 + 16) + (info.isEmpty ? 0 : 8 + listBytes.length) + 8 + data);
  b.add('WAVE'.codeUnits);
  b.add('fmt '.codeUnits);
  u32(16);
  u16(1); // PCM
  u16(1); // mono
  u32(rate);
  u32(rate * 2);
  u16(2);
  u16(16);
  if (info.isNotEmpty) {
    b.add('LIST'.codeUnits);
    u32(listBytes.length);
    b.add(listBytes);
  }
  b.add('data'.codeUnits);
  u32(data);
  b.add(Uint8List(data));
  final f = File(path)..parent.createSync(recursive: true);
  f.writeAsBytesSync(b.takeBytes());
  return f;
}

void main() {
  late Directory tmp;
  late LocalSource src;
  late String music;

  setUp(() async {
    tmp = Directory.systemTemp.createTempSync('ypm_local_');
    music = p.join(tmp.path, 'Music');
    // Album: file name order is the reverse of track number order; after scanning it must be sorted by track number.
    wav(
      p.join(music, 'SZA', 'SOS', 'a.wav'),
      ms: 1500,
      info: {
        'INAM': 'Snooze',
        'IART': 'SZA',
        'IPRD': 'SOS',
        'ITRK': '2',
        'ICRD': '2022-12-09',
      },
    );
    wav(
      p.join(music, 'SZA', 'SOS', 'b.wav'),
      info: {
        'INAM': 'Kill Bill',
        'IART': 'SZA',
        'IPRD': 'SOS',
        'ITRK': '1',
        'ICRD': '2022-12-09',
      },
    );
    File(p.join(music, 'SZA', 'SOS', 'Cover.JPG'))
        .writeAsBytesSync([0xFF, 0xD8]);
    // No tags: guess artist and title from the file name; with a .lrc of the same name.
    wav(p.join(music, 'loose', '03. 陳婧霏 - 晚風.wav'));
    File(p.join(music, 'loose', '03. 陳婧霏 - 晚風.lrc'))
        .writeAsStringSync('[00:00.50]晚风吹过\n[00:00.50]The evening wind');
    // Shouldn't be included: macOS resource fork files and non-audio files.
    File(p.join(music, 'loose', '._junk.wav')).writeAsBytesSync([0]);
    File(p.join(music, 'loose', 'notes.txt')).writeAsStringSync('x');

    src = LocalSource(
      folders: [music, music],
      cacheDir: p.join(tmp.path, 'cache'),
    );
    await src.scan();
  });

  tearDown(() => tmp.deleteSync(recursive: true));

  // Only audio files are included; listing the same folder twice doesn't duplicate.
  test('scans audio files once', () {
    expect(src.trackCount, 3);
  });

  // Albums are sorted by track number, with the folder cover, year and duration.
  test('album groups tagged tracks in track order', () async {
    final home = await src.home();
    final album = home.sections
        .firstWhere((s) => s.title == '专辑')
        .albums
        .single;
    expect((album.name, album.year), ('SOS', 2022));
    expect(album.imageUrl, endsWith('Cover.JPG'));

    final page = await src.album(album.id);
    expect(page.tracks.map((t) => t.name), ['Kill Bill', 'Snooze']);
    expect(page.tracks.last.duration, inInclusiveRange(1450, 1550));
    expect(page.tracks.every((t) => t.source == 'local'), isTrue);
  });

  // Files without tags: strip the track number prefix, split "Artist - Title", and don't assign to any album.
  test('untagged file falls back to filename', () async {
    final r = await src.search('晚風', SearchKind.tracks);
    final t = r.tracks.single;
    expect((t.name, t.artistNames, t.album.id), ('晚風', '陳婧霏', ''));
  });

  // The artist page collects that artist's songs and albums; search is case-insensitive.
  test('artist page and case-insensitive search', () async {
    final found = await src.search('sza', SearchKind.artists);
    final page = await src.artist(found.artists.single.id);
    expect(page.tracks.length, 2);
    expect(page.albums.single.name, 'SOS');
    expect(
      (await src.search('KILL', SearchKind.tracks)).tracks.single.name,
      'Kill Bill',
    );
  });

  // A .lrc with the same name is used as lyrics; a second line with the same timestamp is the translation.
  test('sidecar lrc lyrics', () async {
    final t = (await src.search('晚風', SearchKind.tracks)).tracks.single;
    final l = await src.lyrics(t.id);
    expect(l.lrc, contains('晚风吹过'));
    expect(
      (await src.lyrics(
        (await src.search('Snooze', SearchKind.tracks)).tracks.single.id,
      )).isEmpty,
      isTrue,
    );
  });

  // Sources routes by the song's source to the local source and gets a file:// URL; after the file is deleted it reports unavailable.
  test('stream routes through Sources and reports missing files', () async {
    final sources = Sources()..add(src);
    final t = (await src.search('Kill Bill', SearchKind.tracks)).tracks.single;
    final s = await sources.stream(t);
    expect((Uri.parse(s.url).scheme, s.type), ('file', 'wav'));

    File(t.id).deleteSync();
    await expectLater(
      sources.stream(t),
      throwsA(
        isA<SourceError>().having(
          (e) => e.kind,
          'kind',
          SourceErrorKind.unavailable,
        ),
      ),
    );
  });

  // Ops the source doesn't implement: can() is false and calling throws unsupported.
  test('unsupported ops say so', () async {
    expect(src.can(Op.playlists), isFalse);
    await expectLater(
      src.playlists(),
      throwsA(
        isA<SourceError>().having(
          (e) => e.kind,
          'kind',
          SourceErrorKind.unsupported,
        ),
      ),
    );
  });

  // Multiple artists are split on unambiguous separators, not "&".
  test('splitArtists', () {
    expect(splitArtists('A; B / C、D'), ['A', 'B', 'C', 'D']);
    expect(splitArtists('Simon & Garfunkel'), ['Simon & Garfunkel']);
  });

  test('indexes and finds slash artist names without splitting them', () async {
    final root = p.join(tmp.path, 'slash-artists');
    wav(
      p.join(root, 'single.wav'),
      info: {'INAM': 'Thunderstruck', 'IART': 'AC/DC'},
    );
    wav(
      p.join(root, 'multiple.wav'),
      info: {'INAM': 'Collaboration', 'IART': 'A / B'},
    );
    final local = LocalSource(
      folders: [root],
      cacheDir: p.join(tmp.path, 'slash-cache'),
    );
    await local.scan();

    final library = await local.library(SearchKind.artists);
    expect(
      library.artists.map((a) => a.name),
      unorderedEquals(['AC/DC', 'A', 'B']),
    );
    final artists = await local.search('AC/DC', SearchKind.artists);
    expect(artists.artists.single.name, 'AC/DC');
    final tracks = await local.search('AC/DC', SearchKind.tracks);
    expect(
      (tracks.tracks.single.name, tracks.tracks.single.artistNames),
      ('Thunderstruck', 'AC/DC'),
    );
    final collaboration = await local.search(
      'Collaboration',
      SearchKind.tracks,
    );
    expect(collaboration.tracks.single.artists.map((a) => a.name), ['A', 'B']);
  });

  // Regression: a soundtrack with one song by another artist and no album artist tag used to split into two albums with the same name.
  // Songs in per-disc subfolders (CD1/CD2) count as the same album too.
  test(
    'album without album artist stays whole across artists and discs',
    () async {
      final root = p.join(tmp.path, 'OST');
      wav(
        p.join(root, 'CD1', '01.wav'),
        info: {'INAM': 'a', 'IART': 'Queen', 'IPRD': 'OST'},
      );
      wav(
        p.join(root, 'CD1', '02.wav'),
        info: {'INAM': 'b', 'IART': 'Smile', 'IPRD': 'OST'},
      );
      wav(
        p.join(root, 'CD2', '01.wav'),
        info: {'INAM': 'c', 'IART': 'Queen', 'IPRD': 'OST'},
      );
      final ost = LocalSource(
        folders: [root],
        cacheDir: p.join(tmp.path, 'c2'),
      );
      await ost.scan();
      final album = (await ost.home()).sections
          .firstWhere((s) => s.title == '专辑')
          .albums
          .single;
      expect(album.artists.single.name, 'Queen');
      expect((await ost.album(album.id)).tracks.map((t) => t.artistNames), [
        'Queen',
        'Smile',
        'Queen',
      ]);
    },
  );

  // Progress counts every file read; a missing folder is just empty, not unreadable.
  test('reports progress and treats missing folders as empty', () async {
    final seen = <int>[];
    final s = LocalSource(
      folders: [music, p.join(tmp.path, 'nope')],
      cacheDir: p.join(tmp.path, 'c3'),
    );
    await s.scan(onProgress: seen.add);
    expect(seen, [1, 2, 3]);
    expect(s.trackCount, 3);
    expect(s.unreadable, isEmpty);
  });

  // A folder that can't be listed is skipped and reported; the other folders still load.
  test('skips unreadable folders', () async {
    final locked = Directory(p.join(tmp.path, 'locked'))..createSync();
    wav(p.join(locked.path, 'x.wav'));
    Process.runSync('chmod', ['000', locked.path]);
    addTearDown(() => Process.runSync('chmod', ['755', locked.path]));
    final s = LocalSource(
      folders: [music, locked.path],
      cacheDir: p.join(tmp.path, 'c4'),
    );
    await s.scan();
    expect(s.trackCount, 3);
    expect(s.unreadable, [locked.path]);
  }, skip: Platform.isWindows ? 'needs POSIX permissions' : null);

  // A read that never returns (here a FIFO, like a stuck network drive) trips the watchdog.
  test(
    'skips folders that stop making progress',
    () async {
      final stuck = Directory(p.join(tmp.path, 'stuck'))..createSync();
      Process.runSync('mkfifo', [p.join(stuck.path, 'hang.wav')]);
      final s = LocalSource(
        folders: [music, stuck.path],
        cacheDir: p.join(tmp.path, 'c5'),
      );
      await s.scan(stall: const Duration(seconds: 1));
      expect(s.trackCount, 3);
      expect(s.unreadable, [stuck.path]);
    },
    skip: Platform.isWindows ? 'needs mkfifo' : null,
    timeout: const Timeout(Duration(seconds: 20)),
  );

  // Cancelling throws and leaves the previous index alone.
  test('cancel stops the scan and keeps the old index', () async {
    final f = src.scan();
    src.cancelScan();
    await expectLater(f, throwsA(isA<ScanCancelled>()));
    expect(src.trackCount, 3);
  });

  // Regression: search used to report the first page size (50) as the total.
  test('search reports the full match count across pages', () async {
    final root = p.join(tmp.path, 'Many');
    const n = LocalSource.pageSize + 10;
    for (var i = 0; i < n; i++) {
      wav(
        p.join(root, '$i.wav'),
        ms: 10,
        info: {'INAM': 'Song $i', 'IART': 'Band', 'IPRD': 'Album $i'},
      );
    }
    final many = LocalSource(folders: [root], cacheDir: p.join(tmp.path, 'c6'));
    await many.scan();

    final first = await many.search('song', SearchKind.tracks);
    expect((first.tracks.length, first.more, first.total), (50, true, n));
    final rest = await many.search('song', SearchKind.tracks, offset: 50);
    expect((rest.tracks.length, rest.more, rest.total), (10, false, n));

    final albums = await many.search('album', SearchKind.albums);
    expect((albums.albums.length, albums.total), (50, n));
    final artists = await many.search('band', SearchKind.artists);
    expect((artists.artists.length, artists.total), (1, 1));
  });

  // Regression: when the hash's high bit was 1, cache file names used to contain a minus sign.
  test('fnv1a is unsigned fixed-width hex', () {
    for (final k in ['', 'a', 'Bohemian Rhapsody', '晚風']) {
      expect(fnv1a(k), matches(RegExp(r'^[0-9a-f]{16}$')));
    }
  });
}
