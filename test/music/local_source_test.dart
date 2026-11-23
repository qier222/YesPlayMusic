import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/local/local_source.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/source.dart';

/// 写一个 [ms] 毫秒长的静音 WAV（8kHz 单声道 16 位），[info] 写成 RIFF LIST/INFO
/// 标签（INAM 歌名、IART 艺人、IPRD 专辑、ITRK 曲目号、ICRD 日期）。
/// 用的标签库只能改写已有的 INFO 块、不能新建，所以这里直接写字节。
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
  u16(1); // 单声道
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
    // 专辑：文件名顺序和曲目号顺序相反，扫描后要按曲目号排。
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
    // 没有标签：从文件名猜艺人和歌名；带同名 .lrc。
    wav(p.join(music, 'loose', '03. 陳婧霏 - 晚風.wav'));
    File(p.join(music, 'loose', '03. 陳婧霏 - 晚風.lrc'))
        .writeAsStringSync('[00:00.50]晚风吹过\n[00:00.50]The evening wind');
    // 不该被收录的：macOS 资源分叉文件、非音频文件。
    File(p.join(music, 'loose', '._junk.wav')).writeAsBytesSync([0]);
    File(p.join(music, 'loose', 'notes.txt')).writeAsStringSync('x');

    src = LocalSource(
      folders: [music, music],
      cacheDir: p.join(tmp.path, 'cache'),
    );
    await src.scan();
  });

  tearDown(() => tmp.deleteSync(recursive: true));

  // 只收录音频文件；同一个文件夹列两次不会重复。
  test('scans audio files once', () {
    expect(src.trackCount, 3);
  });

  // 专辑按曲目号排序，带上文件夹封面、年份和时长。
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

  // 没标签的文件：去掉曲目号前缀，按 "艺人 - 歌名" 拆开，不归入任何专辑。
  test('untagged file falls back to filename', () async {
    final r = await src.search('晚風', SearchKind.tracks);
    final t = r.tracks.single;
    expect((t.name, t.artistNames, t.album.id), ('晚風', '陳婧霏', ''));
  });

  // 艺人页汇总该艺人的歌和专辑；搜索不分大小写。
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

  // 同名 .lrc 作为歌词，同时间戳的第二行是翻译。
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

  // 通过 Sources 按歌曲的来源路由到本地源，拿到 file:// 地址；文件删掉后报 unavailable。
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

  // 源没实现的操作：can() 为 false，调用抛 unsupported。
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

  // 按明确分隔符拆多位艺人，不拆 "&"。
  test('splitArtists', () {
    expect(splitArtists('A; B / C、D'), ['A', 'B', 'C', 'D']);
    expect(splitArtists('Simon & Garfunkel'), ['Simon & Garfunkel']);
  });

  // 回归：原声带里有一首歌是别的艺人、标签又没写专辑艺人时，曾被拆成两张同名专辑。
  // 分碟子文件夹（CD1/CD2）里的歌也要算同一张。
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

  // 回归：哈希高位为 1 时，缓存文件名曾带负号。
  test('fnv1a is unsigned fixed-width hex', () {
    for (final k in ['', 'a', 'Bohemian Rhapsody', '晚風']) {
      expect(fnv1a(k), matches(RegExp(r'^[0-9a-f]{16}$')));
    }
  });
}
