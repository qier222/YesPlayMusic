// Music data models, shared by the local source and plugin sources.
//
// JSON field names match the MyGo Music plugin protocol (internal/music/music.go),
// so objects returned by plugins can go straight into fromJson and existing mygo plugins are easier to port.
// All times are in milliseconds. IDs are only meaningful within their own source.

typedef Json = Map<String, dynamic>;

String _s(Object? v) => v == null ? '' : '$v';
int _i(Object? v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
double _d(Object? v) => v is num ? v.toDouble() : double.tryParse('$v') ?? 0;
bool _b(Object? v) => v == true;

/// Converts to Json if it's an object, otherwise an empty object (doesn't throw when a plugin returns the wrong type).
Json _map(Object? v) =>
    v is Map ? v.cast<String, dynamic>() : <String, dynamic>{};

List<T> _list<T>(Object? v, T Function(Json) f) => v is List
    ? [
        for (final e in v)
          if (e is Map) f(e.cast<String, dynamic>()),
      ]
    : <T>[];

/// Drops null values, like Go's omitempty.
Json _compact(Json m) => m
  ..removeWhere(
    (_, v) =>
        v == null ||
        v == '' ||
        v == false ||
        (v is num && v == 0) ||
        (v is List && v.isEmpty),
  );

class Artist {
  const Artist({
    required this.id,
    required this.name,
    this.imageUrl = '',
    this.following = false,
  });

  final String id, name, imageUrl;
  final bool following;

  factory Artist.fromJson(Json j) => Artist(
    id: _s(j['id']),
    name: _s(j['name']),
    imageUrl: _s(j['imageUrl']),
    following: _b(j['following']),
  );

  Json toJson() => _compact({
    'id': id,
    'name': name,
    'imageUrl': imageUrl,
    'following': following,
  });
}

class Album {
  const Album({
    required this.id,
    required this.name,
    this.imageUrl = '',
    this.artists = const [],
    this.released = '',
    this.saved = false,
    this.added = '',
    this.kind = '',
    this.trackCount = 0,
    this.copyright = '',
  });

  final String id, name, imageUrl;
  final List<Artist> artists;

  /// Copyright line, shown as-is at the bottom of the album page, e.g. ℗ 2022 XX Records. Empty if unknown.
  final String copyright;

  /// album, single, ep, compilation; empty if unknown (treated as album).
  final String kind;
  final int trackCount;

  /// The raw string from the source, e.g. 2024-03-01 or 2024.
  final String released;
  final bool saved;

  /// When it was added to the library, ISO 8601 (2024-03-01 or with a time). Empty if unknown.
  final String added;

  int? get year => int.tryParse(released.split('-').first);

  factory Album.fromJson(Json j) => Album(
    id: _s(j['id']),
    name: _s(j['name']),
    imageUrl: _s(j['imageUrl']),
    artists: _list(j['artists'], Artist.fromJson),
    released: _s(j['released']),
    saved: _b(j['saved']),
    added: _s(j['added']),
    kind: _s(j['kind']),
    trackCount: _i(j['trackCount']),
    copyright: _s(j['copyright']),
  );

  Json toJson() => _compact({
    'id': id,
    'name': name,
    'imageUrl': imageUrl,
    'artists': [for (final a in artists) a.toJson()],
    'released': released,
    'saved': saved,
    'added': added,
    'kind': kind,
    'trackCount': trackCount,
    'copyright': copyright,
  });
}

class Track {
  const Track({
    required this.id,
    required this.name,
    this.source = '',
    this.artists = const [],
    this.album = const Album(id: '', name: ''),
    this.duration = 0,
    this.url = '',
    this.unavailable = false,
    this.showId = '',
    this.description = '',
    this.published = '',
    this.added = '',
  });

  final String id, name;

  /// The source id. Sources may leave it out when returning; [Sources] fills it in.
  final String source;
  final List<Artist> artists;
  final Album album;

  /// Milliseconds.
  final int duration;

  /// The song's web page at its source, used for sharing.
  final String url;
  final bool unavailable;

  // Podcast episodes are Tracks too.
  final String showId, description, published;

  /// When it was added to the library, ISO 8601. Empty if unknown.
  final String added;

  /// Globally unique key: the same id in different sources is a different song.
  String get key => '$source:$id';
  String get artistNames => artists.map((a) => a.name).join(', ');
  Duration get length => Duration(milliseconds: duration);

  Track withSource(String s) => source == s
      ? this
      : Track(
          id: id,
          name: name,
          source: s,
          artists: artists,
          album: album,
          duration: duration,
          url: url,
          unavailable: unavailable,
          showId: showId,
          description: description,
          published: published,
          added: added,
        );

  factory Track.fromJson(Json j) => Track(
    id: _s(j['id']),
    name: _s(j['name']),
    source: _s(j['source']),
    artists: _list(j['artists'], Artist.fromJson),
    album: j['album'] is Map
        ? Album.fromJson((j['album'] as Map).cast())
        : const Album(id: '', name: ''),
    duration: _i(j['duration']),
    url: _s(j['url']),
    unavailable: _b(j['unavailable']),
    showId: _s(j['showId']),
    description: _s(j['description']),
    published: _s(j['published']),
    added: _s(j['added']),
  );

  Json toJson() => _compact({
    'id': id,
    'source': source,
    'name': name,
    'artists': [for (final a in artists) a.toJson()],
    'album': album.toJson(),
    'duration': duration,
    'url': url,
    'unavailable': unavailable,
    'showId': showId,
    'description': description,
    'published': published,
    'added': added,
  });
}

class Playlist {
  const Playlist({
    required this.id,
    required this.name,
    this.imageUrl = '',
    this.description = '',
    this.owner = '',
    this.subtitle = '',
    this.trackCount = 0,
    this.mine = false,
    this.saved = false,
    this.fixed = false,
    this.tracks = const [],
    this.plays = 0,
  });

  final String id, name, imageUrl, description, owner;

  /// Play count; 0 means unknown and the card doesn't show it.
  final int plays;

  /// The line under the title on the card (play count, description…); when empty the UI uses the creator and song count.
  final String subtitle;
  final int trackCount;

  /// The user's own playlists.
  final bool mine;

  /// Other people's playlists the user saved.
  final bool saved;

  /// The user's, but maintained by the source (e.g. "Liked Songs"); can't be renamed, deleted or have songs added/removed.
  final bool fixed;
  final List<Track> tracks;

  factory Playlist.fromJson(Json j) => Playlist(
    id: _s(j['id']),
    name: _s(j['name']),
    imageUrl: _s(j['imageUrl']),
    description: _s(j['description']),
    owner: _s(j['owner']),
    subtitle: _s(j['subtitle']),
    trackCount: _i(j['trackCount']),
    mine: _b(j['mine']),
    saved: _b(j['saved']),
    fixed: _b(j['fixed']),
    tracks: _list(j['tracks'], Track.fromJson),
    plays: _i(j['plays']),
  );
}

class AlbumPage {
  const AlbumPage({required this.album, this.tracks = const []});
  final Album album;
  final List<Track> tracks;

  factory AlbumPage.fromJson(Json j) => AlbumPage(
    album: Album.fromJson(_map(j['album'])),
    tracks: _list(j['tracks'], Track.fromJson),
  );
}

class ArtistPage {
  const ArtistPage({
    required this.artist,
    this.tracks = const [],
    this.albums = const [],
    this.related = const [],
  });
  final Artist artist;
  final List<Track> tracks;
  final List<Album> albums;

  /// Similar artists.
  final List<Artist> related;

  factory ArtistPage.fromJson(Json j) => ArtistPage(
    artist: Artist.fromJson(_map(j['artist'])),
    tracks: _list(j['tracks'], Track.fromJson),
    albums: _list(j['albums'], Album.fromJson),
    related: _list(j['related'], Artist.fromJson),
  );
}

class Account {
  const Account({
    required this.id,
    required this.name,
    this.imageUrl = '',
    this.page = '',
  });
  final String id, name, imageUrl;

  /// The user's own browse page ("My home").
  final String page;

  factory Account.fromJson(Json j) => Account(
    id: _s(j['id']),
    name: _s(j['name']),
    imageUrl: _s(j['imageUrl']),
    page: _s(j['page']),
  );
}

/// Profile page (the profile op): account info, stats, top artists and songs, own playlists.
class Profile {
  const Profile({
    required this.name,
    this.imageUrl = '',
    this.signature = '',
    this.badges = const [],
    this.facts = const [],
    this.stats = const [],
    this.topArtists = const [],
    this.topTitle = '',
    this.topTracks = const [],
    this.playlists = const [],
  });
  final String name, imageUrl, signature;

  /// Small badges under the name, e.g. "Lv.9" or "Vinyl VIP".
  final List<String> badges;

  /// A few facts under the name, e.g. (Following, 32).
  final List<({String label, String value})> facts;

  /// Stat cards; at most the first three are shown.
  final List<ProfileStat> stats;
  final List<({Artist artist, int plays})> topArtists;

  /// Title of the listening chart, e.g. "Most played this week".
  final String topTitle;
  final List<({Track track, int plays})> topTracks;

  /// Playlists the user created.
  final List<Playlist> playlists;

  factory Profile.fromJson(Json j) {
    final top = j['topTracks'] is Map
        ? (j['topTracks'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    return Profile(
      name: _s(j['name']),
      imageUrl: _s(j['imageUrl']),
      signature: _s(j['signature']),
      badges: [
        for (final b in j['badges'] is List ? j['badges'] as List : const [])
          if ('$b'.isNotEmpty) '$b',
      ],
      facts: _list(
        j['facts'],
        (f) => (label: _s(f['label']), value: _s(f['value'])),
      ),
      stats: _list(j['stats'], ProfileStat.fromJson),
      topArtists: _list(
        j['topArtists'],
        (a) =>
            (artist: Artist.fromJson(_map(a['artist'])), plays: _i(a['plays'])),
      ),
      topTitle: _s(top['title']),
      topTracks: _list(
        top['tracks'],
        (t) => (track: Track.fromJson(t), plays: _i(t['plays'])),
      ),
      playlists: _list(j['playlists'], Playlist.fromJson),
    );
  }
}

class ProfileStat {
  const ProfileStat({
    required this.label,
    required this.value,
    this.unit = '',
    this.link = '',
  });
  final String label, unit;
  final int value;

  /// Which library tab tapping the card opens: songs, albums, playlists, artists; not tappable when empty.
  final String link;

  factory ProfileStat.fromJson(Json j) => ProfileStat(
    label: _s(j['label']),
    value: _i(j['value']),
    unit: _s(j['unit']),
    link: _s(j['link']),
  );
}

enum SearchKind { tracks, albums, artists, playlists, shows }

class SearchResult {
  const SearchResult({
    this.tracks = const [],
    this.albums = const [],
    this.artists = const [],
    this.playlists = const [],
    this.more = false,
    this.total = 0,
  });
  final List<Track> tracks;
  final List<Album> albums;
  final List<Artist> artists;
  final List<Playlist> playlists;

  /// There is another page.
  final bool more;

  /// Total count (if the source knows); 0 means unknown.
  final int total;

  int get length =>
      tracks.length + albums.length + artists.length + playlists.length;

  factory SearchResult.fromJson(Json j) => SearchResult(
    tracks: _list(j['tracks'], Track.fromJson),
    albums: _list(j['albums'], Album.fromJson),
    artists: _list(j['artists'], Artist.fromJson),
    playlists: _list(j['playlists'], Playlist.fromJson),
    more: _b(j['more']),
    total: _i(j['total']),
  );
}

/// A page of songs.
class TrackPage {
  const TrackPage({this.tracks = const [], this.more = false});
  final List<Track> tracks;
  final bool more;

  factory TrackPage.fromJson(Json j) => TrackPage(
    tracks: _list(j['tracks'], Track.fromJson),
    more: _b(j['more']),
  );
}

/// A comment on a song. A reply to someone else's comment is also a normal comment; [replyTo] is the comment replied to
/// (the UI quotes it under the body, no nested threads).
class Comment {
  const Comment({
    required this.id,
    required this.text,
    this.userId = '',
    this.userName = '',
    this.userImageUrl = '',
    this.time = 0,
    this.likes = 0,
    this.liked = false,
    this.replyTo,
  });
  final String id, text, userId, userName, userImageUrl;

  /// Post time as a millisecond timestamp; 0 means unknown.
  final int time;
  final int likes;
  final bool liked;
  final CommentQuote? replyTo;

  Comment copyWith({int? likes, bool? liked}) => Comment(
    id: id,
    text: text,
    userId: userId,
    userName: userName,
    userImageUrl: userImageUrl,
    time: time,
    likes: likes ?? this.likes,
    liked: liked ?? this.liked,
    replyTo: replyTo,
  );

  factory Comment.fromJson(Json j) {
    final u = _map(j['user']);
    final r = j['replyTo'];
    return Comment(
      id: _s(j['id']),
      text: _s(j['text']),
      userId: _s(u['id']),
      userName: _s(u['name']),
      userImageUrl: _s(u['imageUrl']),
      time: _i(j['time']),
      likes: _i(j['likes']),
      liked: _b(j['liked']),
      replyTo: r is Map ? CommentQuote.fromJson(r.cast()) : null,
    );
  }
}

/// The comment being replied to: who said what.
class CommentQuote {
  const CommentQuote({
    this.id = '',
    required this.userName,
    required this.text,
  });
  final String id, userName, text;

  factory CommentQuote.fromJson(Json j) => CommentQuote(
    id: _s(j['id']),
    userName: _s(_map(j['user'])['name'] ?? j['userName']),
    text: _s(j['text']),
  );
}

/// A page of comments. [total] is the song's total comment count (0 if unknown); [more] means there are more pages.
class CommentPage {
  const CommentPage({
    this.comments = const [],
    this.total = 0,
    this.more = false,
  });
  final List<Comment> comments;
  final int total;
  final bool more;

  factory CommentPage.fromJson(Json j) => CommentPage(
    comments: _list(j['comments'], Comment.fromJson),
    total: _i(j['total']),
    more: _b(j['more']),
  );
}

/// A page organised by the source: the home page, and pages opened from links or navigation.
class Browse {
  const Browse({
    this.title = '',
    this.subtitle = '',
    this.imageUrl = '',
    this.description = '',
    this.sections = const [],
    this.tabs = const [],
    this.filters = const [],
  });
  final String title, subtitle, imageUrl, description;
  final List<Section> sections;

  /// A row of tabs at the top of the page (e.g. Featured, Playlists, Charts…). Tapping one fetches again with its page.
  final List<Choice> tabs;

  /// Sub-tabs under a tab: one or more rows of labels (e.g. region, genre, initial for artists).
  final List<List<Choice>> filters;

  factory Browse.fromJson(Json j) => Browse(
    title: _s(j['title']),
    subtitle: _s(j['subtitle']),
    imageUrl: _s(j['imageUrl']),
    description: _s(j['description']),
    sections: _list(j['sections'], Section.fromJson),
    tabs: _list(j['tabs'], Choice.fromJson),
    filters: [
      if (j['filters'] case final List rows)
        for (final r in rows)
          if (r is List) _list(r, Choice.fromJson),
    ],
  );
}

/// An option on the page (tab or label). With [groups] it opens a grouped menu (e.g. "More categories").
class Choice {
  const Choice({
    required this.title,
    this.page = '',
    this.selected = false,
    this.groups = const [],
    this.images = const [],
  });
  final String title, page;
  final bool selected;
  final List<ChoiceGroup> groups;

  /// Covers stacked to the right of the top group card (at most three).
  final List<String> images;

  factory Choice.fromJson(Json j) => Choice(
    title: _s(j['title']),
    page: _s(j['page']),
    selected: _b(j['selected']),
    groups: _list(j['groups'], ChoiceGroup.fromJson),
    images: [
      if (j['images'] case final List xs)
        for (final x in xs)
          if (x is String && x.isNotEmpty) x,
    ],
  );
}

class ChoiceGroup {
  const ChoiceGroup({required this.title, this.options = const []});
  final String title;
  final List<Choice> options;

  factory ChoiceGroup.fromJson(Json j) => ChoiceGroup(
    title: _s(j['title']),
    options: _list(j['options'], Choice.fromJson),
  );
}

class Section {
  const Section({
    this.title = '',
    this.tracks = const [],
    this.albums = const [],
    this.artists = const [],
    this.playlists = const [],
    this.links = const [],
    this.morePage = '',
    this.empty = '',
    this.pageTitle = '',
    this.subtitle = '',
    this.style = '',
    this.modes = const [],
  });
  final String title;

  /// Which home component to display it with:
  /// - `modes`: special modes ([modes]). The first two are large cards, the rest small rows.
  /// - `shelf`: cards; over one screen they go in two rows and scroll horizontally.
  /// - `songs`: paged song grid (3 columns × 4 rows).
  /// - `charts`: chart cards; the playlist's tracks are the top entries.
  /// - `grid`: cards filling each row, wrapping downward (playlists, albums, artists).
  /// Empty or unrecognised: shown as the original list and cards.
  final String style;
  final List<Mode> modes;
  final List<Track> tracks;
  final List<Album> albums;
  final List<Artist> artists;
  final List<Playlist> playlists;
  final List<Link> links;
  final String morePage, empty, pageTitle, subtitle;

  factory Section.fromJson(Json j) => Section(
    title: _s(j['title']),
    tracks: _list(j['tracks'], Track.fromJson),
    albums: _list(j['albums'], Album.fromJson),
    artists: _list(j['artists'], Artist.fromJson),
    playlists: _list(j['playlists'], Playlist.fromJson),
    links: _list(j['links'], Link.fromJson),
    morePage: _s(j['morePage']),
    empty: _s(j['empty']),
    pageTitle: _s(j['pageTitle']),
    subtitle: _s(j['subtitle']),
    style: _s(j['style']),
    modes: _list(j['modes'], Mode.fromJson),
  );
}

/// Special mode: a set of songs updated daily ([tracks]), a playlist ([playlist]) or a station ([station]).
class Mode {
  const Mode({
    required this.title,
    this.subtitle = '',
    this.note = '',
    this.imageUrl = '',
    this.tracks = const [],
    this.playlist = '',
    this.station = '',
  });
  final String title, subtitle;

  /// Small text above the title, e.g. "Updated daily at 6:00".
  final String note;
  final String imageUrl;
  final List<Track> tracks;

  /// Playlist id: opens the playlist page, and the play button plays the whole playlist.
  final String playlist;

  /// Station id: passed to [Source.station] to fetch songs batch by batch.
  final String station;

  factory Mode.fromJson(Json j) => Mode(
    title: _s(j['title']),
    subtitle: _s(j['subtitle']),
    note: _s(j['note']),
    imageUrl: _s(j['imageUrl']),
    tracks: _list(j['tracks'], Track.fromJson),
    playlist: _s(j['playlist']),
    station: _s(j['station']),
  );
}

class Link {
  const Link({
    required this.title,
    required this.page,
    this.subtitle = '',
    this.imageUrl = '',
  });
  final String title, page, subtitle, imageUrl;

  factory Link.fromJson(Json j) => Link(
    title: _s(j['title']),
    page: _s(j['page']),
    subtitle: _s(j['subtitle']),
    imageUrl: _s(j['imageUrl']),
  );
}

/// Audio handed to the player.
class AudioStream {
  const AudioStream({
    required this.url,
    required this.type,
    this.quality = '',
    this.bitRate = 0,
    this.size = 0,
    this.peak = 0,
    this.gain = 0,
    this.albumPeak = 0,
    this.albumGain = 0,
    this.headers = const {},
  });

  /// http(s):// or file://.
  final String url;

  /// mp3, flac, ogg, wav, m4a, aac…
  final String type;
  final String quality;
  final int bitRate, size;

  /// ReplayGain: track / album gain (dB) and peak (linear, 1 = 0 dBFS). 0 means none.
  /// ReplayGain tags in the file take precedence; these are for streams whose tags
  /// were lost, e.g. when the server transcodes.
  final double peak, gain, albumPeak, albumGain;
  final Map<String, String> headers;

  factory AudioStream.fromJson(Json j) => AudioStream(
    url: _s(j['url']),
    type: _s(j['type']),
    quality: _s(j['quality']),
    bitRate: _i(j['bitRate']),
    size: _i(j['size']),
    peak: _d(j['peak']),
    gain: _d(j['gain']),
    albumPeak: _d(j['albumPeak']),
    albumGain: _d(j['albumGain']),
    headers: j['headers'] is Map
        ? {
            for (final e in (j['headers'] as Map).entries)
              '${e.key}': '${e.value}',
          }
        : const {},
  );
}

/// Lyrics: either LRC text or line-by-line (optionally per-word) [lines]; lines take precedence when present.
class Lyrics {
  const Lyrics({this.lrc = '', this.translation = '', this.lines = const []});
  final String lrc, translation;
  final List<LyricLine> lines;

  bool get isEmpty => lrc.isEmpty && lines.isEmpty;

  factory Lyrics.fromJson(Json j) => Lyrics(
    lrc: _s(j['lrc']),
    translation: _s(j['translation']),
    lines: _list(j['lines'], LyricLine.fromJson),
  );
}

class LyricLine {
  const LyricLine({
    required this.start,
    this.end = 0,
    this.text = '',
    this.translation = '',
    this.words = const [],
  });
  final int start, end;
  final String text, translation;
  final List<LyricWord> words;

  factory LyricLine.fromJson(Json j) {
    final words = _list(j['words'], LyricWord.fromJson);
    final text = _s(j['text']);
    return LyricLine(
      start: _i(j['start']),
      end: _i(j['end']),
      text: text.isEmpty ? words.map((w) => w.text).join() : text,
      translation: _s(j['translation']),
      words: words,
    );
  }
}

class LyricWord {
  const LyricWord({required this.start, required this.end, required this.text});
  final int start, end;
  final String text;

  factory LyricWord.fromJson(Json j) =>
      LyricWord(start: _i(j['start']), end: _i(j['end']), text: _s(j['text']));
}

/// How the song is heard: stream is played by this app; remote plays elsewhere (e.g. Apple Music,
/// Spotify Connect) and this app only acts as a remote control.
enum Playback { stream, remote }

class Setting {
  const Setting({
    required this.key,
    required this.label,
    this.help = '',
    this.link = '',
    this.type = 'text',
    this.defaultValue = '',
    this.op = '',
    this.options = const [],
  });
  final String key, label, help, link;

  /// text, password, boolean, select; unknown ones are treated as text. The value is always a string.
  final String type;

  /// Default value when never saved (e.g. "true" for a boolean that defaults to on).
  final String defaultValue;

  /// Optional capability tied to a boolean switch (e.g. "comments"); when off, the capability counts as unsupported.
  final String op;
  final List<SettingOption> options;

  factory Setting.fromJson(Json j) => Setting(
    key: _s(j['key']),
    label: _s(j['label']),
    help: _s(j['help']),
    link: _s(j['link']),
    type: j['type'] == null ? 'text' : _s(j['type']),
    defaultValue: j['default'] == true ? 'true' : _s(j['default']),
    op: _s(j['op']),
    options: _list(
      j['options'],
      (o) => SettingOption(value: _s(o['value']), label: _s(o['label'])),
    ),
  );
}

class SettingOption {
  const SettingOption({required this.value, required this.label});
  final String value, label;
}

/// Sidebar entry: the source's own browse page ([page]) or a built-in app page ([builtin]:
/// home、liked、savedAlbums、stations、shows）。
class NavItem {
  const NavItem({
    this.title = '',
    this.page = '',
    this.builtin = '',
    this.icon = '',
  });
  final String title, page, builtin, icon;

  factory NavItem.fromJson(Json j) => NavItem(
    title: _s(j['title']),
    page: _s(j['page']),
    builtin: _s(j['builtin']),
    icon: _s(j['icon']),
  );
}

/// The source's self-description; a plugin's plugin.json has the same shape (plus main, permissions, etc.).
class SourceInfo {
  const SourceInfo({
    required this.id,
    required this.name,
    this.version = '',
    this.playback = Playback.stream,
    this.settings = const [],
    this.navigation = const [],
  });
  final String id, name, version;
  final Playback playback;
  final List<Setting> settings;
  final List<NavItem> navigation;

  factory SourceInfo.fromJson(Json j) => SourceInfo(
    id: _s(j['id']),
    name: _s(j['name']),
    version: _s(j['version']),
    playback: j['playback'] == 'remote' ? Playback.remote : Playback.stream,
    settings: _list(j['settings'], Setting.fromJson),
    navigation: _list(j['navigation'], NavItem.fromJson),
  );
}

/// A trending search: the term plus an optional note.
class HotSearch {
  const HotSearch(this.word, [this.hint = '']);
  final String word, hint;

  static List<HotSearch> listFrom(Object? v) => [
    if (v is List)
      for (final x in v)
        if (x is Map && _s(x['word']).isNotEmpty)
          HotSearch(_s(x['word']), _s(x['hint']))
        else if (x is String && x.isNotEmpty)
          HotSearch(x),
  ];
}

/// An item a plugin adds to the song context menu. Clicking it calls the plugin's menuAction.
class MenuEntry {
  const MenuEntry({
    required this.id,
    required this.title,
    this.icon = '',
    this.danger = false,
  });
  final String id, title;

  /// Name of a built-in icon (e.g. radio, music, arrow-right); the default icon is used when empty or unknown.
  final String icon;
  final bool danger;

  factory MenuEntry.fromJson(Json j) => MenuEntry(
    id: _s(j['id']),
    title: _s(j['title']),
    icon: _s(j['icon']),
    danger: _b(j['danger']),
  );
}

/// A plugin's customisation of a song's context menu: items to add and built-in items to hide.
class TrackMenu {
  const TrackMenu({this.items = const [], this.hide = const {}});
  final List<MenuEntry> items;

  /// Names of built-in items: play, next, queue, like, addToPlaylist, album, artist,
  /// similar、dislike、remove。
  final Set<String> hide;

  /// Plugins can return an array of items directly, or {items, hide}.
  factory TrackMenu.fromJson(Object? v) {
    if (v is List) {
      return TrackMenu(items: _list(v, MenuEntry.fromJson));
    }
    if (v is Map) {
      final j = v.cast<String, dynamic>();
      return TrackMenu(
        items: _list(j['items'], MenuEntry.fromJson),
        hide: {
          for (final h in (j['hide'] is List ? j['hide'] as List : const []))
            '$h',
        },
      );
    }
    return const TrackMenu();
  }
}

/// What the app should do after a plugin runs a menu item; all optional.
class MenuResult {
  const MenuResult({
    this.toast = '',
    this.copy = '',
    this.openKind = '',
    this.openId = '',
    this.tracks = const [],
    this.name = '',
    this.station = '',
    this.seed = '',
  });

  /// A one-line message.
  final String toast;

  /// Text to copy to the clipboard (e.g. a share link).
  final String copy;

  /// Page to open: kind is album, artist or playlist.
  final String openKind, openId;

  /// Songs to play; [name] is shown in "Now Playing · from …".
  final List<Track> tracks;
  final String name;

  /// Station to play (the plugin's station id), with [seed] as the starting song.
  final String station, seed;

  factory MenuResult.fromJson(Object? v) {
    if (v is! Map) return const MenuResult();
    final j = v.cast<String, dynamic>();
    final open = j['open'] is Map
        ? (j['open'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    final st = j['station'] is Map
        ? (j['station'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    return MenuResult(
      toast: _s(j['toast']),
      copy: _s(j['copy']),
      openKind: _s(open['kind']),
      openId: _s(open['id']),
      tracks: _list(j['tracks'], Track.fromJson),
      name: _s(j['name']),
      station: _s(st['id']),
      seed: _s(st['seed']),
    );
  }
}
