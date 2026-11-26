// 本地音乐源：扫描用户选的文件夹，读取标签、封面和 .lrc 歌词。
//
// ID 约定（只在本源内有意义）：
//   歌曲  = 文件绝对路径
//   专辑  = 'al:' + 专辑艺人 + '\x01' + 专辑名（都做了大小写折叠）
//   艺人  = 'ar:' + 艺人名（折叠）

import 'dart:io';
import 'dart:isolate';

import 'package:audio_metadata_reader/audio_metadata_reader.dart' as tags;
import 'package:path/path.dart' as p;

import '../../l10n/l10n.dart';
import '../lrc.dart';
import '../models.dart';
import '../source.dart';
import 'kgm.dart';

/// 本地源能播放的扩展名 → Stream.type。
const audioTypes = {
  '.mp3': 'mp3',
  '.flac': 'flac',
  '.m4a': 'm4a',
  '.mp4': 'm4a',
  '.aac': 'aac',
  '.ogg': 'ogg',
  '.opus': 'opus',
  '.wav': 'wav',
  '.aif': 'aiff',
  '.aiff': 'aiff',
  '.aifc': 'aiff',
  '.ape': 'ape',
};

/// 文件夹里会被当作专辑封面的图片（不区分大小写）。
const _coverNames = ['cover', 'folder', 'front', 'album', 'albumart'];
const _coverExts = ['.jpg', '.jpeg', '.png', '.webp'];

/// 搜索、分组用的折叠：小写、去首尾空白、合并空白。
String fold(String s) => s.toLowerCase().trim().replaceAll(RegExp(r'\s+'), ' ');

/// 扫描结果里的一首歌。只含基本类型，可以跨 isolate 传递。
class LocalEntry {
  LocalEntry({
    required this.path,
    required this.title,
    required this.artists,
    required this.album,
    required this.albumArtist,
    required this.year,
    required this.disc,
    required this.number,
    required this.durationMs,
    required this.cover,
    required this.modified,
  });

  final String path, title, album, cover;

  /// 标签里没写时，扫描结束后由 [_fillAlbumArtists] 补上。
  String albumArtist;
  final List<String> artists;
  final int year, disc, number, durationMs;
  final DateTime modified;
}

class LocalSource extends Source {
  /// [folders]：要扫描的文件夹；[cacheDir]：存放从标签里提取出的封面。
  LocalSource({required this.folders, required this.cacheDir});

  final List<String> folders;
  final String cacheDir;

  @override
  SourceInfo get info => SourceInfo(
    id: 'local',
    name: L.sourceLocal,
    navigation: [NavItem(builtin: 'home', title: L.sourceLocal, icon: 'note')],
  );

  @override
  final Set<String> ops = const {
    Op.home,
    Op.search,
    Op.library,
    Op.album,
    Op.artist,
    Op.lyrics,
    Op.stream,
  };

  List<LocalEntry> _entries = const [];
  Map<String, LocalEntry> _byPath = const {};
  Map<String, List<LocalEntry>> _byAlbum = const {};
  Map<String, List<LocalEntry>> _byArtist = const {};

  /// 专辑加进来的时间：里面最新的那个文件的修改时间。
  Map<String, String> _albumAdded = const {};

  List<LocalEntry> get entries => _entries;
  int get trackCount => _entries.length;

  /// 重新扫描所有文件夹。读标签是同步 IO，放到后台 isolate 里做。
  Future<void> scan() async {
    final folders = List.of(this.folders), cacheDir = this.cacheDir;
    final list = await Isolate.run(() => scanFolders(folders, cacheDir));
    _index(list);
  }

  void _index(List<LocalEntry> list) {
    _entries = list;
    _byPath = {for (final e in list) e.path: e};
    final byAlbum = <String, List<LocalEntry>>{};
    final byArtist = <String, List<LocalEntry>>{};
    for (final e in list) {
      if (e.album.isNotEmpty) (byAlbum[albumId(e)] ??= []).add(e);
      for (final a in e.artists) {
        (byArtist[artistId(a)] ??= []).add(e);
      }
    }
    for (final ts in byAlbum.values) {
      ts.sort((a, b) {
        final c = a.disc.compareTo(b.disc);
        if (c != 0) return c;
        final n = a.number.compareTo(b.number);
        return n != 0 ? n : a.path.compareTo(b.path);
      });
    }
    _byAlbum = byAlbum;
    _byArtist = byArtist;
    _albumAdded = {
      for (final MapEntry(:key, :value) in byAlbum.entries)
        key: value
            .map((e) => e.modified)
            .reduce((a, b) => a.isAfter(b) ? a : b)
            .toIso8601String(),
    };
  }

  static String albumId(LocalEntry e) =>
      'al:${fold(e.albumArtist)}\x01${fold(e.album)}';
  static String artistId(String name) => 'ar:${fold(name)}';

  String _uri(String path) => path.isEmpty ? '' : Uri.file(path).toString();

  Album _album(LocalEntry e) => e.album.isEmpty
      ? const Album(id: '', name: '')
      : Album(
          id: albumId(e),
          name: e.album,
          imageUrl: _uri(e.cover),
          artists: e.albumArtist.isEmpty
              ? const []
              : [Artist(id: artistId(e.albumArtist), name: e.albumArtist)],
          released: e.year > 0 ? '${e.year}' : '',
          added: _albumAdded[albumId(e)] ?? '',
        );

  Track track(LocalEntry e) => Track(
    id: e.path,
    source: id,
    name: e.title,
    artists: [for (final a in e.artists) Artist(id: artistId(a), name: a)],
    album: _album(e),
    duration: e.durationMs,
    added: e.modified.toIso8601String(),
  );

  List<Album> _albums(Iterable<LocalEntry> es) {
    final seen = <String>{};
    return [
      for (final e in es)
        if (e.album.isNotEmpty && seen.add(albumId(e))) _album(e),
    ];
  }

  List<Artist> _artists() {
    final names = <String, String>{};
    for (final e in _entries) {
      for (final a in e.artists) {
        names.putIfAbsent(artistId(a), () => a);
      }
    }
    final list = [
      for (final m in names.entries) Artist(id: m.key, name: m.value),
    ];
    list.sort((a, b) => fold(a.name).compareTo(fold(b.name)));
    return list;
  }

  @override
  Future<Browse> home() async {
    final recent = List.of(_entries)
      ..sort((a, b) => b.modified.compareTo(a.modified));
    final albums = _albums(_entries)
      ..sort((a, b) => fold(a.name).compareTo(fold(b.name)));
    return Browse(
      title: L.sourceLocal,
      subtitle: L.countSongs(trackCount),
      sections: [
        Section(
          title: L.localRecentlyAdded,
          tracks: [for (final e in recent.take(30)) track(e)],
          empty: L.localEmptyHint,
        ),
        Section(title: L.tabAlbums, albums: albums),
        Section(title: L.tabArtists, artists: _artists()),
      ],
    );
  }

  static const pageSize = 50;

  @override
  Future<SearchResult> search(
    String query,
    SearchKind kind, {
    int offset = 0,
  }) async {
    final q = fold(query);
    if (q.isEmpty) return const SearchResult();
    bool hit(String s) => fold(s).contains(q);

    List<T> page<T>(List<T> all) => all.skip(offset).take(pageSize).toList();
    bool more(int n) => offset + pageSize < n;

    switch (kind) {
      case SearchKind.tracks:
        final all = [
          for (final e in _entries)
            if (hit(e.title) || e.artists.any(hit) || hit(e.album)) e,
        ];
        return SearchResult(
          tracks: page(all).map(track).toList(),
          more: more(all.length),
        );
      case SearchKind.albums:
        final all = _albums(
          _entries.where((e) => hit(e.album) || hit(e.albumArtist)),
        );
        return SearchResult(albums: page(all), more: more(all.length));
      case SearchKind.artists:
        final all = _artists().where((a) => hit(a.name)).toList();
        return SearchResult(artists: page(all), more: more(all.length));
      case SearchKind.playlists:
      case SearchKind.shows:
        return const SearchResult();
    }
  }

  /// 本地的整个曲库一次给完。
  @override
  Future<SearchResult> library(SearchKind kind, {int offset = 0}) async {
    if (offset > 0) return const SearchResult();
    return switch (kind) {
      SearchKind.tracks => SearchResult(tracks: _entries.map(track).toList()),
      SearchKind.albums => SearchResult(albums: _albums(_entries)),
      SearchKind.artists => SearchResult(artists: _artists()),
      _ => const SearchResult(),
    };
  }

  @override
  Future<AlbumPage> album(String id) async {
    final es = _byAlbum[id];
    if (es == null) throw SourceError(SourceErrorKind.failed, L.albumNotFound);
    return AlbumPage(album: _album(es.first), tracks: es.map(track).toList());
  }

  @override
  Future<ArtistPage> artist(String id) async {
    final es = _byArtist[id];
    if (es == null) {
      throw SourceError(SourceErrorKind.failed, L.localArtistNotFound);
    }
    final name = es.first.artists.firstWhere((a) => artistId(a) == id);
    final albums = _albums(es)
      ..sort((a, b) => b.released.compareTo(a.released));
    return ArtistPage(
      artist: Artist(id: id, name: name),
      tracks: es.map(track).toList(),
      albums: albums,
    );
  }

  @override
  Future<AudioStream> stream(String id, {String quality = 'high'}) async {
    final e = _byPath[id];
    final original = File(id);
    if (e == null || !await original.exists()) {
      throw SourceError(SourceErrorKind.unavailable, L.localFileMovedOrDeleted);
    }
    final type = audioTypes[p.extension(id).toLowerCase()] ?? '';
    var audio = original;
    if (type == 'flac') {
      try {
        audio = await KgmDecoder.materializeFlac(original, cacheDir);
      } on FormatException catch (e) {
        throw SourceError(SourceErrorKind.unavailable, e.message);
      }
    }
    return AudioStream(
      url: Uri.file(audio.path).toString(),
      type: type,
      quality: 'lossless',
      size: await audio.length(),
    );
  }

  /// 先找同名 .lrc（以及 .trans.lrc 翻译），没有再读标签里内嵌的歌词。
  @override
  Future<Lyrics> lyrics(String id) async {
    final base = p.withoutExtension(id);
    final lrc = _readText('$base.lrc');
    if (lrc != null) {
      return Lyrics(lrc: lrc, translation: _readText('$base.trans.lrc') ?? '');
    }
    final embedded = await Isolate.run(() {
      try {
        return tags.readMetadata(File(id)).lyrics ?? '';
      } catch (_) {
        return '';
      }
    });
    // 内嵌的可能只是纯文本（没有时间戳），这时当作没有逐行歌词。
    if (parseLrc(embedded).isEmpty) return const Lyrics();
    return Lyrics(lrc: embedded);
  }

  static String? _readText(String path) {
    final f = File(path);
    if (!f.existsSync()) return null;
    try {
      return f.readAsStringSync();
    } on FormatException {
      return null; // 非 UTF-8（比如 GBK）的 LRC，暂不支持
    }
  }
}

// ───────────── 扫描（在后台 isolate 里跑） ─────────────

/// 扫描文件夹，返回所有能识别的音频文件。读不出标签的文件也收录，用文件名兜底。
List<LocalEntry> scanFolders(List<String> folders, String cacheDir) {
  final out = <LocalEntry>[];
  final seen = <String>{};
  final folderCovers = <String, String>{};
  final tagCovers = <String, String>{}; // 专辑键 → 已提取的封面
  for (final folder in folders) {
    final dir = Directory(folder);
    if (!dir.existsSync()) continue;
    final files =
        dir
            .listSync(recursive: true, followLinks: false)
            .whereType<File>()
            .where(
              (f) => audioTypes.containsKey(p.extension(f.path).toLowerCase()),
            )
            .where((f) => !p.basename(f.path).startsWith('._')) // macOS 资源分叉文件
            .toList()
          ..sort((a, b) => a.path.compareTo(b.path));
    for (final f in files) {
      final path = p.normalize(f.absolute.path);
      if (!seen.add(path)) continue;
      out.add(_entry(f, path, cacheDir, folderCovers, tagCovers));
    }
  }
  _fillAlbumArtists(out);
  return out;
}

/// 同一张专辑所在的文件夹。CD1、Disc 2 这类分碟子文件夹算作上一级，
/// 这样多碟专辑不会被拆开。
String albumDir(String path) {
  final dir = p.dirname(path);
  return RegExp(
        r'^(cd|disc|disk)\s*\d+$',
        caseSensitive: false,
      ).hasMatch(p.basename(dir))
      ? p.dirname(dir)
      : dir;
}

/// 标签里没有专辑艺人时，不能拿每首歌自己的艺人当专辑艺人，否则原声带、
/// 合辑里有一首歌是别的艺人，就会被拆成两张同名专辑。
/// 这里按"同一文件夹 + 同一专辑名"分组，取组里出现最多的艺人作为专辑艺人。
void _fillAlbumArtists(List<LocalEntry> entries) {
  final groups = <String, List<LocalEntry>>{};
  for (final e in entries) {
    if (e.album.isEmpty || e.albumArtist.isNotEmpty) continue;
    (groups['${albumDir(e.path)}\x01${fold(e.album)}'] ??= []).add(e);
  }
  for (final g in groups.values) {
    final counts = <String, int>{};
    for (final e in g) {
      if (e.artists.isNotEmpty) {
        counts[e.artists.first] = (counts[e.artists.first] ?? 0) + 1;
      }
    }
    if (counts.isEmpty) continue;
    final top = counts.entries.reduce((a, b) => b.value > a.value ? b : a).key;
    for (final e in g) {
      e.albumArtist = top;
    }
  }
}

LocalEntry _entry(
  File f,
  String path,
  String cacheDir,
  Map<String, String> folderCovers,
  Map<String, String> tagCovers,
) {
  tags.AudioMetadata? m;
  try {
    m = tags.readMetadata(f, getImage: true);
  } catch (_) {
    m = null;
  }

  final (fileArtist, fileTitle) = _fromFilename(
    p.basenameWithoutExtension(path),
  );
  final title = _clean(m?.title) ?? fileTitle;
  var artists = splitArtists(_clean(m?.artist) ?? '');
  if (artists.isEmpty && m != null) {
    artists = [for (final s in m.performers) ...splitArtists(s)];
  }
  if (artists.isEmpty && fileArtist.isNotEmpty) artists = [fileArtist];
  final album = _clean(m?.album) ?? '';
  final albumArtist = _clean(m?.albumArtist) ?? '';

  final dir = p.dirname(path);
  var cover = folderCovers.putIfAbsent(dir, () => _folderCover(dir));
  if (cover.isEmpty && m != null && m.pictures.isNotEmpty) {
    // 专辑艺人此时可能还没确定，按文件夹 + 专辑名去重。
    final key = album.isEmpty ? path : '${albumDir(path)}\x01${fold(album)}';
    cover = tagCovers[key] ??= _saveCover(m.pictures, key, cacheDir);
  }

  return LocalEntry(
    path: path,
    title: title,
    artists: artists,
    album: album,
    albumArtist: album.isEmpty ? '' : albumArtist,
    year: m?.year?.year ?? 0,
    disc: m?.discNumber ?? 0,
    number: m?.trackNumber ?? 0,
    durationMs: m?.duration?.inMilliseconds ?? 0,
    cover: cover,
    modified: f.statSync().modified,
  );
}

String? _clean(String? s) {
  final t = s?.replaceAll('\x00', '').trim();
  return t == null || t.isEmpty ? null : t;
}

/// 没有标签时从文件名猜："01. 艺人 - 歌名" → (艺人, 歌名)。
(String, String) _fromFilename(String name) {
  final n = name.replaceFirst(RegExp(r'^\d{1,3}[\s.\-_]+'), '');
  final i = n.indexOf(' - ');
  if (i <= 0) return ('', n.trim());
  return (n.substring(0, i).trim(), n.substring(i + 3).trim());
}

/// 拆分多位艺人。只按明确的分隔符拆，不拆 "&"、"and"（太多乐队名里有）。
List<String> splitArtists(String s) => [
  for (final part in s.split(RegExp(r'\s*(?:;|/|、|\x00)\s*')))
    if (part.trim().isNotEmpty) part.trim(),
];

String _folderCover(String dir) {
  try {
    for (final f in Directory(dir).listSync().whereType<File>()) {
      final ext = p.extension(f.path).toLowerCase();
      final base = p.basenameWithoutExtension(f.path).toLowerCase();
      if (_coverExts.contains(ext) && _coverNames.contains(base)) return f.path;
    }
  } on FileSystemException {
    // 没权限之类，当作没有封面
  }
  return '';
}

/// 把标签里的封面写到缓存目录，同一张专辑只写一次。优先用"封面"类型的图。
String _saveCover(List<tags.Picture> pics, String key, String cacheDir) {
  final pic = pics.firstWhere(
    (x) => x.pictureType == tags.PictureType.coverFront,
    orElse: () => pics.first,
  );
  final ext = switch (pic.mimetype.toLowerCase()) {
    'image/png' => '.png',
    'image/webp' => '.webp',
    _ => '.jpg',
  };
  final file = File(p.join(cacheDir, 'covers', '${fnv1a(key)}$ext'));
  try {
    if (!file.existsSync() || file.lengthSync() != pic.bytes.length) {
      file.parent.createSync(recursive: true);
      file.writeAsBytesSync(pic.bytes, flush: true);
    }
    return file.path;
  } on FileSystemException {
    return '';
  }
}

/// 64 位 FNV-1a，用来给缓存文件起稳定的名字。
String fnv1a(String s) {
  var h = 0xcbf29ce484222325;
  for (final c in s.codeUnits) {
    h ^= c;
    h *= 0x100000001b3; // 按 64 位回绕
  }
  // Dart 的 int 是有符号的，分成高低 32 位输出，避免出现负号。
  String hex(int v) => v.toRadixString(16).padLeft(8, '0');
  return hex((h >>> 32) & 0xFFFFFFFF) + hex(h & 0xFFFFFFFF);
}
