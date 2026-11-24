// Music sources: local music is one source, and each plugin is a source too.
//
// Op names map one-to-one to the functions plugins export (search, album, stream…). For ops a source doesn't implement,
// can() returns false and the UI hides the entry; calling it anyway just throws unsupported.

import '../l10n/l10n.dart';
import 'models.dart';

/// Kinds of errors plugins or sources can throw, matching `throw {code: 'signIn', ...}` in plugins.
enum SourceErrorKind {
  /// Sign-in required.
  signIn,

  /// A required setting is missing (e.g. an API key).
  setup,

  /// This song can't be played (licensing, region, VIP…).
  unavailable,

  /// The source doesn't support this op.
  unsupported,

  /// Other failures.
  failed,
}

class SourceError implements Exception {
  const SourceError(this.kind, [this.reason = '']);
  final SourceErrorKind kind;

  /// The source's message to the user, e.g. "Please fill in the Cookie in settings".
  final String reason;

  @override
  String toString() => reason.isEmpty
      ? 'SourceError(${kind.name})'
      : 'SourceError(${kind.name}): $reason';
}

/// All op names for a source, which are also the function names plugins can export.
abstract final class Op {
  static const signIn = 'signIn', signOut = 'signOut', account = 'account';

  /// Tries the unsaved values in the settings dialog (Test Connection in plugin settings).
  static const testConnection = 'testConnection';
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

  /// Song context menu: plugins add their own items (trackMenu) and run them when clicked (menuAction).
  static const trackMenu = 'trackMenu', menuAction = 'menuAction';

  /// Scrobbling: for a track from any source, nowPlaying is called when it
  /// starts and scrobble once it has been listened to long enough. Every plugin
  /// that exports them is called, not just the current music source.
  static const nowPlaying = 'nowPlaying', scrobble = 'scrobble';

  /// Playback state changed (track change, play / pause, seek, stop), e.g. to
  /// show a Discord status. Sent to every plugin that exports it, like
  /// scrobbling.
  static const playback = 'playback';
}

/// A music source. Subclasses override only the methods they support and list them in [ops].
abstract class Source {
  SourceInfo get info;
  String get id => info.id;

  /// Ops this source supports (names from [Op]).
  Set<String> get ops;
  bool can(String op) => ops.contains(op);

  Never _no(String op) => throw SourceError(
    SourceErrorKind.unsupported,
    L.sourceErrUnsupported(info.name, op),
  );

  // ── Settings ──
  String setting(String key) => '';
  Future<void> setSetting(String key, String value) async => _no('setSetting');

  /// Tries to connect with [settings] (not saved yet). Returns a message for the
  /// user on success (may be empty); throws [SourceError] on failure.
  Future<String> testConnection(Map<String, String> settings) async =>
      _no(Op.testConnection);

  // ── Account ──
  Future<Account?> signIn() async => _no(Op.signIn);
  Future<void> signOut() async => _no(Op.signOut);
  Future<Account?> account() async => _no(Op.account);

  /// The signed-in account's profile page.
  Future<Profile> profile() async => _no(Op.profile);

  // ── Discover ──
  Future<Browse> home() async => _no(Op.home);
  Future<Browse> browse(String page) async => _no(Op.browse);
  Future<SearchResult> search(
    String query,
    SearchKind kind, {
    int offset = 0,
  }) async => _no(Op.search);
  Future<List<String>> suggest(String query) async => _no(Op.suggest);

  /// Trending search terms, shown while the search box is empty.
  Future<List<HotSearch>> hotSearches() async => _no(Op.hotSearches);

  /// All songs, albums or artists in the library ([SearchKind.tracks]/albums/artists),
  /// one page from [offset]; results go in the matching [SearchResult] field, with more if there's more.
  /// Only for sources where "the whole library is the user's", like self-hosted servers and local music; streaming sources
  /// represent the library with liked and savedAlbums.
  Future<SearchResult> library(SearchKind kind, {int offset = 0}) async =>
      _no(Op.library);

  // ── Library ──
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

  // ── Playlists ──
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

  // ── Playback ──
  Future<Lyrics> lyrics(String id) async => _no(Op.lyrics);

  /// Songs similar to a song ("Similar songs" on the Now Playing page).
  Future<List<Track>> similar(String id) async => _no(Op.similar);

  /// The next batch of songs for a station. [seed] is the song to continue from (current or last in queue); may be empty.
  Future<TrackPage> station(String id, {String seed = ''}) async =>
      _no(Op.station);

  /// Dislike this song: don't recommend it again. [station] is the station playing; may be empty.
  Future<void> dislike(String id, {String station = ''}) async =>
      _no(Op.dislike);

  /// One page of comments for song [id] from [offset]. [sort] is hot or new.
  Future<CommentPage> comments(
    String id, {
    String sort = 'hot',
    int offset = 0,
  }) async => _no(Op.comments);

  /// Posts a comment on song [id]; [replyTo] is the id of the comment replied to, empty to comment on the song itself.
  /// Returns the posted comment if the source can provide it (the UI inserts it at the top), otherwise null.
  Future<Comment?> postComment(
    String id,
    String text, {
    String replyTo = '',
  }) async => _no(Op.postComment);

  /// Likes or unlikes comment [commentId] on song [id].
  Future<void> likeComment(String id, String commentId, bool on) async =>
      _no(Op.likeComment);

  /// Context menu customisation for this song. [playlist] is the playlist id the menu was opened in; may be empty.
  /// Should decide from the song data only, without network access: the menu waits for it to open.
  Future<TrackMenu> trackMenu(Track track, {String playlist = ''}) async =>
      _no(Op.trackMenu);

  /// Runs an item given by [trackMenu].
  Future<MenuResult> menuAction(
    String id,
    Track track, {
    String playlist = '',
  }) async => _no(Op.menuAction);

  /// A track from any source started playing ("now playing" for scrobbling).
  Future<void> nowPlaying(Track track) async => _no(Op.nowPlaying);

  /// A track from any source was listened to long enough to count as a listen.
  /// [startedAt] is when playback started; [playedMs] is how long it was
  /// actually listened to. See Scrobbler for the rules.
  Future<void> scrobble(
    Track track, {
    required DateTime startedAt,
    required int playedMs,
  }) async => _no(Op.scrobble);

  /// Playback state changed. [track] is null when nothing is playing;
  /// [positionMs] is the position right now.
  Future<void> playback(
    Track? track, {
    required bool playing,
    required int positionMs,
  }) async => _no(Op.playback);

  /// [quality] is one of [qualities]; the source returns the closest one it has.
  Future<AudioStream> stream(String id, {String quality = 'high'}) async =>
      _no(Op.stream);

  Future<void> close() async {}
}

/// All loaded sources. Finds sources by id and fills in [Track.source] on songs returned by a source.
class Sources {
  final Map<String, Source> _byId = {};

  Iterable<Source> get all => _byId.values;
  Source? operator [](String id) => _byId[id];

  void add(Source s) {
    if (_byId.containsKey(s.id)) {
      throw StateError('A source with id ${s.id} already exists');
    }
    _byId[s.id] = s;
  }

  Future<void> remove(String id) async => _byId.remove(id)?.close();

  /// The source a song belongs to.
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
