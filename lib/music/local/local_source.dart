// Local music source: scans folders the user picked and reads tags, covers and .lrc lyrics.
//
// ID conventions (meaningful only within this source):
//   song   = absolute file path
//   album  = 'al:' + album artist + '\x01' + album name (both case-folded)
//   artist = 'ar:' + artist name (folded)

import 'dart:async';
import 'dart:io';
import 'dart:isolate';

import 'package:audio_metadata_reader/audio_metadata_reader.dart' as tags;
import 'package:crypto/crypto.dart';
import 'package:path/path.dart' as p;

import '../../l10n/l10n.dart';
import '../lrc.dart';
import '../models.dart';
import '../source.dart';

/// Extensions the local source can play → Stream.type.
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

/// Images in a folder treated as the album cover (case-insensitive).
const _coverNames = ['cover', 'folder', 'front', 'album', 'albumart'];
const _coverExts = ['.jpg', '.jpeg', '.png', '.webp'];

/// Folding for search and grouping: lowercase, trim, collapse whitespace.
String fold(String s) => s.toLowerCase().trim().replaceAll(RegExp(r'\s+'), ' ');

/// A song in the scan results. Only primitive types, so it can cross isolates.
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

  /// Filled in by [_fillAlbumArtists] after the scan when the tags don't have it.
  String albumArtist;
  final List<String> artists;
  final int year, disc, number, durationMs;
  final DateTime modified;
}

class LocalSource extends Source {
  /// [folders]: folders to scan; [cacheDir]: where covers extracted from tags are stored.
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

  /// When the album was added: the modification time of its newest file.
  Map<String, String> _albumAdded = const {};

  List<LocalEntry> get entries => _entries;
  int get trackCount => _entries.length;

  /// How long a folder may go without progress before its scan is abandoned. Calls like listing a
  /// directory or reading a file are synchronous, so on a stuck network drive they can block forever.
  static const stallTimeout = Duration(seconds: 30);

  final _cancel = Completer<void>();

  /// Folders skipped by the last [scan] because they couldn't be read or stopped making progress.
  List<String> unreadable = const [];

  /// Stops a running [scan]: it throws [ScanCancelled] and the index stays as it was.
  void cancelScan() {
    if (!_cancel.isCompleted) _cancel.complete();
  }

  /// Rescans all folders. Reading tags is synchronous IO, so each folder runs in its own
  /// background isolate. A folder that fails or stalls for [stall] is skipped and listed in
  /// [unreadable]; the others still make it into the index. [onProgress] gets the number of files read so far.
  Future<void> scan({
    void Function(int files)? onProgress,
    Duration stall = stallTimeout,
  }) async {
    final folders = {for (final f in this.folders) p.normalize(f)};
    var done = 0;
    final results = await Future.wait([
      for (final folder in folders)
        _scanFolder(folder, cacheDir, stall, _cancel.future, () {
          onProgress?.call(++done);
        }),
    ]);
    if (_cancel.isCompleted) throw ScanCancelled();
    final failed = <String>[];
    final seen = <String>{};
    final list = <LocalEntry>[];
    for (final (i, folder) in folders.indexed) {
      final r = results[i];
      if (r == null) {
        failed.add(folder);
        continue;
      }
      for (final e in r) {
        if (seen.add(e.path)) list.add(e);
      }
    }
    _fillAlbumArtists(list);
    unreadable = failed;
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

  String _albumCover(LocalEntry e) {
    if (e.cover.isNotEmpty) return e.cover;
    for (final track in _byAlbum[albumId(e)] ?? const <LocalEntry>[]) {
      if (track.cover.isNotEmpty) return track.cover;
    }
    return '';
  }

  Album _album(LocalEntry e, {bool withAlbumCover = false}) => e.album.isEmpty
      ? const Album(id: '', name: '')
      : Album(
          id: albumId(e),
          name: e.album,
          imageUrl: _uri(withAlbumCover ? _albumCover(e) : e.cover),
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
        if (e.album.isNotEmpty && seen.add(albumId(e)))
          _album(e, withAlbumCover: true),
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
          total: all.length,
        );
      case SearchKind.albums:
        final all = _albums(
          _entries.where((e) => hit(e.album) || hit(e.albumArtist)),
        );
        return SearchResult(
          albums: page(all),
          more: more(all.length),
          total: all.length,
        );
      case SearchKind.artists:
        final all = _artists().where((a) => hit(a.name)).toList();
        return SearchResult(
          artists: page(all),
          more: more(all.length),
          total: all.length,
        );
      case SearchKind.playlists:
      case SearchKind.shows:
        return const SearchResult();
    }
  }

  /// The whole local library is returned at once.
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
    return AlbumPage(
      album: _album(es.first, withAlbumCover: true),
      tracks: es.map(track).toList(),
    );
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
    if (e == null || !File(id).existsSync()) {
      throw SourceError(SourceErrorKind.unavailable, L.localFileMovedOrDeleted);
    }
    return AudioStream(
      url: Uri.file(id).toString(),
      type: audioTypes[p.extension(id).toLowerCase()] ?? '',
      quality: 'lossless',
      size: File(id).lengthSync(),
    );
  }

  /// Looks for a .lrc with the same name (and a .trans.lrc translation) first, then lyrics embedded in the tags.
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
    // Embedded lyrics may be plain text (no timestamps); then treat it as having no line-by-line lyrics.
    if (parseLrc(embedded).isEmpty) return const Lyrics();
    return Lyrics(lrc: embedded);
  }

  static String? _readText(String path) {
    final f = File(path);
    if (!f.existsSync()) return null;
    try {
      return f.readAsStringSync();
    } on FormatException {
      return null; // non-UTF-8 LRC (e.g. GBK) isn't supported yet
    }
  }
}

// ───────────── Scanning (runs in background isolates) ─────────────

/// Thrown by [LocalSource.scan] after [LocalSource.cancelScan].
class ScanCancelled implements Exception {}

/// Worker → main isolate: the finished folder.
class _Done {
  const _Done(this.entries);
  final List<LocalEntry> entries;
}

/// Scans one folder in its own isolate. Returns null when it fails or makes no progress for [stall];
/// the isolate is killed then, since a call blocked on IO can't be interrupted any other way.
Future<List<LocalEntry>?> _scanFolder(
  String folder,
  String cacheDir,
  Duration stall,
  Future<void> cancel,
  void Function() onFile,
) async {
  final port = ReceivePort();
  final result = Completer<List<LocalEntry>?>();
  Isolate? iso;
  Timer? watchdog;
  void finish(List<LocalEntry>? r) {
    if (result.isCompleted) return;
    watchdog?.cancel();
    port.close();
    iso?.kill(priority: Isolate.immediate);
    result.complete(r);
  }

  void arm() {
    watchdog?.cancel();
    watchdog = Timer(stall, () => finish(null));
  }

  unawaited(cancel.then((_) => finish(null)));
  arm();
  port.listen((msg) {
    switch (msg) {
      case _Done(:final entries):
        finish(entries);
      case 1:
        onFile();
        arm();
      case 0:
        arm();
      default:
        finish(null); // uncaught error (a [message, stack] list) or exit without a result (null)
    }
  });
  try {
    iso = await Isolate.spawn(
      _folderWorker,
      (port.sendPort, folder, cacheDir),
      onError: port.sendPort,
      onExit: port.sendPort,
    );
    if (result.isCompleted) iso.kill(priority: Isolate.immediate);
  } catch (_) {
    finish(null);
  }
  return result.future;
}

/// Runs in the worker isolate. Sends 0 for each directory listed and 1 for each file read
/// (both reset the watchdog), then [_Done] with every recognised audio file. Files whose tags
/// can't be read are included too, falling back to the file name.
void _folderWorker((SendPort, String, String) args) {
  final (out, folder, cacheDir) = args;
  final root = Directory(folder);
  // A missing folder (e.g. an unplugged drive or a default that doesn't exist) is just empty.
  if (!root.existsSync()) return out.send(const _Done([]));
  final files = <File>[];
  _walk(root, files, () => out.send(0), isRoot: true);
  files.sort((a, b) => a.path.compareTo(b.path));
  final folderCovers = <String, String>{};
  final tagCovers = <String, String>{}; // album key → extracted cover
  final entries = <LocalEntry>[];
  for (final f in files) {
    final path = p.normalize(f.absolute.path);
    entries.add(_entry(f, path, cacheDir, folderCovers, tagCovers));
    out.send(1);
  }
  out.send(_Done(entries));
}

/// Collects audio files under [dir]. An unreadable subfolder is skipped; an unreadable root throws.
void _walk(
  Directory dir,
  List<File> out,
  void Function() onDir, {
  bool isRoot = false,
}) {
  final List<FileSystemEntity> items;
  try {
    items = dir.listSync(followLinks: false);
  } on FileSystemException {
    if (isRoot) rethrow;
    return;
  }
  onDir();
  for (final e in items) {
    if (e is Directory) {
      _walk(e, out, onDir);
    } else if (e is File &&
        audioTypes.containsKey(p.extension(e.path).toLowerCase()) &&
        // macOS resource fork files
        !p.basename(e.path).startsWith('._')) {
      out.add(e);
    }
  }
}

/// The folder an album lives in. Per-disc subfolders like CD1 or Disc 2 count as the parent,
/// so multi-disc albums aren't split.
String albumDir(String path) {
  final dir = p.dirname(path);
  return RegExp(
        r'^(cd|disc|disk)\s*\d+$',
        caseSensitive: false,
      ).hasMatch(p.basename(dir))
      ? p.dirname(dir)
      : dir;
}

/// Fill missing album artists from an unambiguous tag in the same folder and album.
/// Otherwise, use the most frequent track artist among the untagged tracks so compilations stay together.
void _fillAlbumArtists(List<LocalEntry> entries) {
  final groups = <(String, String), List<LocalEntry>>{};
  for (final e in entries) {
    if (e.album.isEmpty) continue;
    (groups[(albumDir(e.path), fold(e.album))] ??= []).add(e);
  }
  for (final g in groups.values) {
    final tagged = <String, String>{};
    final untagged = <LocalEntry>[];
    final counts = <String, int>{};
    for (final e in g) {
      if (e.albumArtist.isNotEmpty) {
        tagged.putIfAbsent(fold(e.albumArtist), () => e.albumArtist);
      } else {
        untagged.add(e);
        if (e.artists.isNotEmpty) {
          counts[e.artists.first] = (counts[e.artists.first] ?? 0) + 1;
        }
      }
    }
    final artist = tagged.length == 1
        ? tagged.values.single
        : counts.isEmpty
        ? ''
        : counts.entries.reduce((a, b) => b.value > a.value ? b : a).key;
    for (final e in untagged) {
      e.albumArtist = artist;
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
  final albumFolder = albumDir(path);
  String coverIn(String folder) =>
      folderCovers.putIfAbsent(folder, () => _folderCover(folder));
  var cover = coverIn(dir);
  if (cover.isEmpty && albumFolder != dir) cover = coverIn(albumFolder);
  if (cover.isEmpty && m != null && m.pictures.isNotEmpty) {
    // The album artist may not be settled yet, so deduplicate by folder + album name.
    final key = album.isEmpty ? path : '$albumFolder\x01${fold(album)}';
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

/// Guesses from the file name when there are no tags: "01. Artist - Title" → (artist, title).
(String, String) _fromFilename(String name) {
  final n = name.replaceFirst(RegExp(r'^\d{1,3}[\s.\-_]+'), '');
  final i = n.indexOf(' - ');
  if (i <= 0) return ('', n.trim());
  return (n.substring(0, i).trim(), n.substring(i + 3).trim());
}

/// Splits multiple artists. Only splits on unambiguous separators, not "&" or "and" (too many band names contain them).
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
    // No permission or similar: treat as no cover
  }
  return '';
}

/// Writes the cover from the tags to the cache directory, once per album. Prefers images of the "cover" type.
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
  final digest = sha256.convert(pic.bytes);
  final file = File(p.join(cacheDir, 'covers', '${fnv1a(key)}-$digest$ext'));
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

/// 64-bit FNV-1a, used to give cache files stable names.
String fnv1a(String s) {
  var h = 0xcbf29ce484222325;
  for (final c in s.codeUnits) {
    h ^= c;
    h *= 0x100000001b3; // wraps at 64 bits
  }
  // Dart ints are signed; output high and low 32 bits separately to avoid a minus sign.
  String hex(int v) => v.toRadixString(16).padLeft(8, '0');
  return hex((h >>> 32) & 0xFFFFFFFF) + hex(h & 0xFFFFFFFF);
}
