// Plugin data requests: which source, which op, what params, how to decode into a model, how long it stays fresh.
// Pages pass a request to AppState for data (peekData / loadData); caching, storing and background
// refetching all happen in AppState and SwrStore.

import '../music/models.dart' as m;
import '../music/source.dart';
import 'swr.dart';

/// Freshness for each kind of data (the table in the design).
abstract final class Policies {
  static const home = CachePolicy(
    fresh: Duration(minutes: 5),
    maxAge: Duration(days: 7),
  );
  static const browse = CachePolicy(
    fresh: Duration(minutes: 10),
    maxAge: Duration(days: 3),
  );
  static const album = CachePolicy(
    fresh: Duration(days: 1),
    maxAge: Duration(days: 30),
  );
  static const artist = CachePolicy(
    fresh: Duration(hours: 1),
    maxAge: Duration(days: 14),
  );
  static const playlist = CachePolicy(
    fresh: Duration(minutes: 10),
    maxAge: Duration(days: 7),
  );

  /// My playlists, liked songs, library: refetched on every open, showing the old data meanwhile.
  static const mine = CachePolicy(
    fresh: Duration.zero,
    maxAge: Duration(days: 30),
  );
  static const lyrics = CachePolicy(
    fresh: Duration(days: 3650),
    maxAge: Duration(days: 90),
  );
  static const similar = CachePolicy(
    fresh: Duration(days: 1),
    maxAge: Duration(days: 7),
  );
  static const hotSearches = CachePolicy(
    fresh: Duration(hours: 1),
    maxAge: Duration(days: 1),
  );
  static const search = CachePolicy(
    fresh: Duration(minutes: 5),
    maxAge: Duration(minutes: 30),
    persist: false,
  );
}

class DataReq<T> {
  const DataReq({
    required this.source,
    required this.path,
    required this.op,
    required this.params,
    required this.decode,
    required this.policy,
    required this.direct,
    this.trackList = false,
  });

  /// The plugin returns a plain list of songs: tag each with the source id when fetched.
  final bool trackList;

  final String source;

  /// Key under this source, e.g. album/123.
  final String path;

  /// Plugin op and params: plugin sources store the raw JSON in the cache.
  final String op;
  final Map<String, Object?> params;
  final T Function(Object? raw) decode;
  final CachePolicy policy;

  /// Non-plugin sources (local music): called directly, not cached.
  final Future<T> Function(Source s) direct;

  // ── Common ones ──

  static m.Json _j(Object? raw) => (raw as Map).cast<String, Object?>();

  static DataReq<m.Browse> home(String source) => DataReq(
    source: source,
    path: 'home',
    op: Op.home,
    params: const {},
    decode: _browse,
    policy: Policies.home,
    direct: (s) => s.home(),
  );

  /// Discover page: an empty [page] is the default page.
  static DataReq<m.Browse> browse(String source, String page) => DataReq(
    source: source,
    path: page.isEmpty ? 'browse' : 'browse/$page',
    op: Op.browse,
    params: {'page': page},
    decode: _browse,
    policy: Policies.browse,
    direct: (s) => s.browse(page),
  );

  static DataReq<m.AlbumPage> album(String source, String id) => DataReq(
    source: source,
    path: 'album/$id',
    op: Op.album,
    params: {'id': id},
    decode: _album,
    policy: Policies.album,
    direct: (s) => s.album(id),
  );

  static DataReq<m.ArtistPage> artist(String source, String id) => DataReq(
    source: source,
    path: 'artist/$id',
    op: Op.artist,
    params: {'id': id},
    decode: _artist,
    policy: Policies.artist,
    direct: (s) => s.artist(id),
  );

  static DataReq<m.Playlist> playlist(String source, String id) => DataReq(
    source: source,
    path: 'playlist/$id',
    op: Op.playlist,
    params: {'id': id},
    decode: _playlist,
    policy: Policies.playlist,
    direct: (s) => s.playlist(id),
  );

  static DataReq<m.Lyrics> lyrics(String source, String id) => DataReq(
    source: source,
    path: 'lyrics/$id',
    op: Op.lyrics,
    params: {'id': id},
    decode: _lyrics,
    policy: Policies.lyrics,
    direct: (s) => s.lyrics(id),
  );

  static DataReq<List<m.Track>> similar(String source, String id) => DataReq(
    source: source,
    path: 'similar/$id',
    op: Op.similar,
    params: {'id': id},
    decode: _trackList,
    policy: Policies.similar,
    direct: (s) => s.similar(id),
    trackList: true,
  );

  static DataReq<m.Profile> profile(String source) => DataReq(
    source: source,
    path: 'profile',
    op: Op.profile,
    params: const {},
    decode: _profile,
    policy: Policies.mine,
    direct: (s) => s.profile(),
  );

  static DataReq<List<m.HotSearch>> hotSearches(String source) => DataReq(
    source: source,
    path: 'hotSearches',
    op: Op.hotSearches,
    params: const {},
    decode: m.HotSearch.listFrom,
    policy: Policies.hotSearches,
    direct: (s) => s.hotSearches(),
  );

  // decode is a top-level function: CacheEntry only recognises it was already decoded when it's the same function
  static m.Browse _browse(Object? raw) => m.Browse.fromJson(_j(raw));
  static m.AlbumPage _album(Object? raw) => m.AlbumPage.fromJson(_j(raw));
  static m.ArtistPage _artist(Object? raw) => m.ArtistPage.fromJson(_j(raw));
  static m.Playlist _playlist(Object? raw) => m.Playlist.fromJson(_j(raw));
  static m.Lyrics _lyrics(Object? raw) => m.Lyrics.fromJson(_j(raw));
  static m.Profile _profile(Object? raw) => m.Profile.fromJson(_j(raw));
  static List<m.Track> _trackList(Object? raw) => [
    for (final t in raw as List? ?? const []) m.Track.fromJson(_j(t)),
  ];
}
