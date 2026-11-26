import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/local/local_source.dart';
import 'package:yesplaymusic/music/lrc.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/source.dart';

/// Writes a silent WAV [ms] milliseconds long (8kHz mono 16-bit), with [info] as RIFF LIST/INFO
/// tags (INAM title, IART artist, IPRD album, ITRK track number, ICRD date).
/// The tag library can only rewrite existing INFO chunks, not create them, so bytes are written directly here.
File wav(
  String path, {
  int ms = 1000,
  Map<String, String> info = const {},
  List<int> cover = const [],
}) {
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
  final id3 = BytesBuilder();
  if (cover.isNotEmpty) {
    final picture = [0, ...'image/jpeg'.codeUnits, 0, 3, 0, ...cover];
    id3.add([
      ...'ID3'.codeUnits,
      3,
      0,
      0,
      0,
      0,
      0,
      10 + picture.length,
      ...'APIC'.codeUnits,
      0,
      0,
      0,
      picture.length,
      0,
      0,
      ...picture,
    ]);
  }
  final id3Bytes = id3.takeBytes();
  final id3Padding = id3Bytes.length.isOdd ? 1 : 0;
  final data = rate * ms ~/ 1000 * 2;

  b.add('RIFF'.codeUnits);
  u32(
    4 +
        (8 + 16) +
        (info.isEmpty ? 0 : 8 + listBytes.length) +
        (cover.isEmpty ? 0 : 8 + id3Bytes.length + id3Padding) +
        8 +
        data,
  );
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
  if (cover.isNotEmpty) {
    b.add('ID3 '.codeUnits);
    u32(id3Bytes.length);
    b.add(id3Bytes);
    if (id3Padding != 0) b.addByte(0);
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

  test('disc tracks use their own cover or the album folder cover', () async {
    final albumFolder = p.join(music, 'Multi-disc');
    for (final folder in ['CD1', 'CD2', 'Disc 3', 'dIsK 4']) {
      wav(
        p.join(albumFolder, folder, 'track.wav'),
        info: {'INAM': folder, 'IPRD': 'Multi-disc'},
      );
    }
    final albumCover = File(p.join(albumFolder, 'cover.png'))
      ..writeAsBytesSync([0]);
    final discCover = File(p.join(albumFolder, 'CD1', 'folder.jpg'))
      ..writeAsBytesSync([0]);
    await src.scan();

    final album = (await src.search(
      'Multi-disc',
      SearchKind.albums,
    )).albums.single;
    final tracks = (await src.album(album.id)).tracks;
    expect(
      {for (final t in tracks) t.name: t.album.imageUrl},
      {
        'CD1': discCover.uri.toString(),
        'CD2': albumCover.uri.toString(),
        'Disc 3': albumCover.uri.toString(),
        'dIsK 4': albumCover.uri.toString(),
      },
    );
  });

  test(
    'covers do not fall back from non-disc folders or past the parent',
    () async {
      final artist = p.join(music, 'Artist');
      wav(p.join(artist, 'Bonus', 'track.wav'));
      wav(p.join(artist, 'Album', 'CD1', 'track.wav'));
      File(p.join(artist, 'cover.png')).writeAsBytesSync([0]);
      await src.scan();

      final covers = {
        for (final e in src.entries)
          if (p.isWithin(artist, e.path))
            p.basename(p.dirname(e.path)): e.cover,
      };
      expect(covers, {'Bonus': '', 'CD1': ''});
    },
  );

  test('folder covers take precedence over embedded art', () async {
    final albumFolder = p.join(music, 'Embedded');
    const embedded = [0xFF, 0xD8, 0xFF, 0xD9];
    final track = wav(
      p.join(albumFolder, 'CD1', 'track.wav'),
      info: {'INAM': 'Embedded Track', 'IPRD': 'Embedded'},
      cover: embedded,
    );

    Future<String> cover() async {
      await src.scan();
      return src.entries.singleWhere((e) => e.path == track.path).cover;
    }

    expect(File(await cover()).readAsBytesSync(), embedded);
    final albumCover = File(p.join(albumFolder, 'cover.png'))
      ..writeAsBytesSync([0]);
    expect(await cover(), albumCover.path);
    final discCover = File(p.join(albumFolder, 'CD1', 'cover.png'))
      ..writeAsBytesSync([0]);
    expect(await cover(), discCover.path);
  });

  for (final restart in [true, false]) {
    test(
      'refreshes same-size embedded art on ${restart ? 'restart' : 'rescan'}',
      () async {
        final path = p.join(music, 'Embedded', 'track.wav');
        const before = [0xFF, 0xD8, 1, 0xFF, 0xD9];
        const after = [0xFF, 0xD8, 2, 0xFF, 0xD9];
        File writeTrack(List<int> cover) =>
            wav(path, info: {'IPRD': 'Embedded'}, cover: cover);

        Future<String> scanCover(LocalSource source) async {
          await source.scan();
          return (await source.search(
            'Embedded',
            SearchKind.albums,
          )).albums.single.imageUrl;
        }

        final track = writeTrack(before);
        final size = track.lengthSync();
        final modified = track.lastModifiedSync();
        final oldCover = await scanCover(src);
        expect(File.fromUri(Uri.parse(oldCover)).readAsBytesSync(), before);

        writeTrack(after).setLastModifiedSync(modified);
        expect(track.lengthSync(), size);
        final source = restart
            ? LocalSource(folders: src.folders, cacheDir: src.cacheDir)
            : src;
        final newCover = await scanCover(source);
        expect(File.fromUri(Uri.parse(newCover)).readAsBytesSync(), after);
        expect(newCover, isNot(oldCover));
        expect(await scanCover(source), newCover);
      },
    );
  }

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

  test('enhanced sidecar lyrics and translation keep their prefixes', () async {
    final t = (await src.search('晚風', SearchKind.tracks)).tracks.single;
    final base = p.withoutExtension(t.id);
    File('$base.lrc').writeAsStringSync('[00:00.10]晚风<00:00.50>吹过');
    File('$base.trans.lrc')
        .writeAsStringSync('[00:00.10]The <00:00.50>evening wind');
    final line = lyricLines(await src.lyrics(t.id)).single;
    expect((line.text, line.translation), ('晚风吹过', 'The evening wind'));
    expect(line.words.first.start, 100);
  });

  test('embedded enhanced LRC keeps the prefix', () async {
    final comment = 'LYRICS=[00:02.00]Open <00:02.80>the door'.codeUnits;
    final block = ByteData(12)
      ..setUint32(4, 1, Endian.little)
      ..setUint32(8, comment.length, Endian.little);
    final file = File(p.join(music, 'embedded.flac'))
      ..writeAsBytesSync([
        ...'fLaC'.codeUnits,
        0x84,
        0,
        0,
        block.lengthInBytes + comment.length,
        ...block.buffer.asUint8List(),
        ...comment,
      ]);
    final line = lyricLines(await src.lyrics(file.path)).single;
    expect((line.text, line.words.first.start), ('Open the door', 2000));
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
