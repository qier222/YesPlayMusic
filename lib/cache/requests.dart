// 插件数据的请求：哪个源、调哪个操作、带什么参数、怎么转成模型、多久算新。
// 页面拿着请求问 AppState 要数据（peekData / loadData），缓存、存盘、后台
// 重取都在 AppState 和 SwrStore 里。

import '../music/models.dart' as m;
import '../music/source.dart';
import 'swr.dart';

/// 各种数据的新鲜度（方案里的那张表）。
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

  /// 我的歌单、红心、音乐库：每次打开都重取，旧的先顶着。
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

  /// 插件返回的直接是歌曲列表：取到时每首标上源 id。
  final bool trackList;

  final String source;

  /// 在这个源下面的 key，比如 album/123。
  final String path;

  /// 插件操作和参数：插件源直接取原始 JSON 存进缓存。
  final String op;
  final Map<String, Object?> params;
  final T Function(Object? raw) decode;
  final CachePolicy policy;

  /// 不是插件的源（本地音乐）：直接调，不进缓存。
  final Future<T> Function(Source s) direct;

  // ── 常用的几种 ──

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

  /// 发现页：[page] 空的是默认页。
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

  // decode 用顶层函数：同一个函数，CacheEntry 才认得出转过了
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
