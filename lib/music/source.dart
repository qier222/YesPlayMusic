// 音乐源：本地音乐是一个源，每个插件也是一个源。
//
// 操作名与插件导出的函数名一一对应（search、album、stream…）。源没实现的操作，
// can() 返回 false，界面就不显示对应入口；调用了也只会抛 unsupported。

import '../l10n/l10n.dart';
import 'models.dart';

/// 插件或源可以抛的几类错误，对应插件里 `throw {code: 'signIn', ...}`。
enum SourceErrorKind {
  /// 需要先登录。
  signIn,

  /// 缺少必要的设置（如 API Key）。
  setup,

  /// 这首歌放不了（版权、地区、VIP…）。
  unavailable,

  /// 源不支持这个操作。
  unsupported,

  /// 其他失败。
  failed,
}

class SourceError implements Exception {
  const SourceError(this.kind, [this.reason = '']);
  final SourceErrorKind kind;

  /// 源给用户的说明，比如"请在设置里填写 Cookie"。
  final String reason;

  @override
  String toString() => reason.isEmpty
      ? 'SourceError(${kind.name})'
      : 'SourceError(${kind.name}): $reason';
}

/// 源的全部操作名，也是插件可以导出的函数名。
abstract final class Op {
  static const signIn = 'signIn', signOut = 'signOut', account = 'account';
  static const profile = 'profile';
  static const home = 'home', browse = 'browse';
  static const search = 'search', suggest = 'suggest';
  static const hotSearches = 'hotSearches';
  static const library = 'library';
  static const recent = 'recent', played = 'played';
  static const liked = 'liked', isLiked = 'isLiked', like = 'like';
  static const album = 'album', artist = 'artist';
  static const saveAlbum = 'saveAlbum', followArtist = 'followArtist';
  static const savedAlbums = 'savedAlbums';
  static const playlists = 'playlists', playlist = 'playlist';
  static const savePlaylist = 'savePlaylist';
  static const createPlaylist = 'createPlaylist';
  static const renamePlaylist = 'renamePlaylist';
  static const deletePlaylist = 'deletePlaylist';
  static const addToPlaylist = 'addToPlaylist';
  static const removeFromPlaylist = 'removeFromPlaylist';
  static const movePlaylistTrack = 'movePlaylistTrack';
  static const lyrics = 'lyrics', stream = 'stream';
  static const similar = 'similar';
  static const station = 'station', dislike = 'dislike';
  static const comments = 'comments', postComment = 'postComment';
  static const likeComment = 'likeComment';

  /// 歌曲右键菜单：插件加自己的条目（trackMenu），点了执行（menuAction）。
  static const trackMenu = 'trackMenu', menuAction = 'menuAction';
}

/// 一个音乐源。子类只覆盖自己支持的方法，并在 [ops] 里列出它们。
abstract class Source {
  SourceInfo get info;
  String get id => info.id;

  /// 这个源支持的操作（[Op] 里的名字）。
  Set<String> get ops;
  bool can(String op) => ops.contains(op);

  Never _no(String op) => throw SourceError(
    SourceErrorKind.unsupported,
    L.sourceErrUnsupported(info.name, op),
  );

  // ── 设置 ──
  String setting(String key) => '';
  Future<void> setSetting(String key, String value) async => _no('setSetting');

  // ── 账号 ──
  Future<Account?> signIn() async => _no(Op.signIn);
  Future<void> signOut() async => _no(Op.signOut);
  Future<Account?> account() async => _no(Op.account);

  /// 登录账号的个人主页。
  Future<Profile> profile() async => _no(Op.profile);

  // ── 发现 ──
  Future<Browse> home() async => _no(Op.home);
  Future<Browse> browse(String page) async => _no(Op.browse);
  Future<SearchResult> search(
    String query,
    SearchKind kind, {
    int offset = 0,
  }) async => _no(Op.search);
  Future<List<String>> suggest(String query) async => _no(Op.suggest);

  /// 热门搜索词；搜索框空着时显示。
  Future<List<HotSearch>> hotSearches() async => _no(Op.hotSearches);

  /// 音乐库里的全部歌曲、专辑或艺人（[SearchKind.tracks]/albums/artists），
  /// 从 [offset] 起的一页；结果放在 [SearchResult] 对应的字段里，还有就 more。
  /// 自建服务器、本地音乐这类「整个曲库就是用户的」源才有；流媒体源用
  /// liked、savedAlbums 表示音乐库。
  Future<SearchResult> library(SearchKind kind, {int offset = 0}) async =>
      _no(Op.library);

  // ── 资料库 ──
  Future<List<Track>> recent() async => _no(Op.recent);
  Future<void> played(Track track) async {}
  Future<TrackPage> liked({int offset = 0}) async => _no(Op.liked);
  Future<Map<String, bool>> isLiked(List<String> ids) async => _no(Op.isLiked);
  Future<void> like(String id, bool on) async => _no(Op.like);
  Future<AlbumPage> album(String id) async => _no(Op.album);
  Future<ArtistPage> artist(String id) async => _no(Op.artist);
  Future<void> saveAlbum(String id, bool on) async => _no(Op.saveAlbum);
  Future<void> followArtist(String id, bool on) async => _no(Op.followArtist);
  Future<List<Album>> savedAlbums({int offset = 0}) async =>
      _no(Op.savedAlbums);

  // ── 歌单 ──
  Future<List<Playlist>> playlists() async => _no(Op.playlists);
  Future<Playlist> playlist(String id) async => _no(Op.playlist);
  Future<void> savePlaylist(String id, bool on) async => _no(Op.savePlaylist);
  Future<Playlist> createPlaylist(String name) async => _no(Op.createPlaylist);
  Future<void> renamePlaylist(String id, String name) async =>
      _no(Op.renamePlaylist);
  Future<void> deletePlaylist(String id) async => _no(Op.deletePlaylist);
  Future<void> addToPlaylist(String id, List<String> trackIds) async =>
      _no(Op.addToPlaylist);
  Future<void> removeFromPlaylist(String id, List<String> trackIds) async =>
      _no(Op.removeFromPlaylist);
  Future<void> movePlaylistTrack(String id, int from, int to) async =>
      _no(Op.movePlaylistTrack);

  // ── 播放 ──
  Future<Lyrics> lyrics(String id) async => _no(Op.lyrics);

  /// 和某首歌相似的歌（正在播放页的「相似歌曲」）。
  Future<List<Track>> similar(String id) async => _no(Op.similar);

  /// 电台的下一批歌。[seed] 是接着哪首歌放（当前或队列最后一首），可以为空。
  Future<TrackPage> station(String id, {String seed = ''}) async =>
      _no(Op.station);

  /// 不喜欢这首歌：以后别再推荐。[station] 是正在放的电台，可以为空。
  Future<void> dislike(String id, {String station = ''}) async =>
      _no(Op.dislike);

  /// 歌曲 [id] 的评论，从 [offset] 起的一页。[sort] 是 hot（热门）或 new（最新）。
  Future<CommentPage> comments(
    String id, {
    String sort = 'hot',
    int offset = 0,
  }) async => _no(Op.comments);

  /// 给歌曲 [id] 发评论；[replyTo] 是被回复的评论 id，空表示直接评论这首歌。
  /// 源能给出发出去的那条就返回它（界面直接插到列表最上面），否则返回 null。
  Future<Comment?> postComment(
    String id,
    String text, {
    String replyTo = '',
  }) async => _no(Op.postComment);

  /// 给歌曲 [id] 下的评论 [commentId] 点赞或取消。
  Future<void> likeComment(String id, String commentId, bool on) async =>
      _no(Op.likeComment);

  /// 这首歌右键菜单的定制。[playlist] 是右键时所在的歌单 id，可以为空。
  /// 只应该看歌曲数据决定，不要联网：菜单打开时等它。
  Future<TrackMenu> trackMenu(Track track, {String playlist = ''}) async =>
      _no(Op.trackMenu);

  /// 执行 [trackMenu] 给的一项。
  Future<MenuResult> menuAction(
    String id,
    Track track, {
    String playlist = '',
  }) async => _no(Op.menuAction);

  /// [quality] 取 [qualities] 之一；源按自己有的返回最接近的。
  Future<AudioStream> stream(String id, {String quality = 'high'}) async =>
      _no(Op.stream);

  Future<void> close() async {}
}

/// 所有已加载的源。按 id 找源，并给源返回的歌曲补上 [Track.source]。
class Sources {
  final Map<String, Source> _byId = {};

  Iterable<Source> get all => _byId.values;
  Source? operator [](String id) => _byId[id];

  void add(Source s) {
    if (_byId.containsKey(s.id)) {
      throw StateError('已有 id 为 ${s.id} 的源');
    }
    _byId[s.id] = s;
  }

  Future<void> remove(String id) async => _byId.remove(id)?.close();

  /// 歌曲所属的源。
  Source of(Track t) =>
      _byId[t.source] ??
      (throw SourceError(
        SourceErrorKind.failed,
        L.sourceErrNotFound(t.source),
      ));

  Future<AudioStream> stream(Track t, {String quality = 'high'}) =>
      of(t).stream(t.id, quality: quality);

  Future<Lyrics> lyrics(Track t) {
    final s = of(t);
    return s.can(Op.lyrics) ? s.lyrics(t.id) : Future.value(const Lyrics());
  }

  Future<void> closeAll() async {
    for (final s in _byId.values) {
      await s.close();
    }
    _byId.clear();
  }
}
