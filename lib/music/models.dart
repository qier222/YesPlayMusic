// 音乐数据模型：本地源和插件源共用。
//
// JSON 字段名与 MyGo Music 插件协议（internal/music/music.go）保持一致，
// 这样插件返回的对象可以直接 fromJson，已有的 mygo 插件也更容易移植。
// 时间一律是毫秒。ID 只在各自的源内有意义。

typedef Json = Map<String, dynamic>;

String _s(Object? v) => v == null ? '' : '$v';
int _i(Object? v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
double _d(Object? v) => v is num ? v.toDouble() : double.tryParse('$v') ?? 0;
bool _b(Object? v) => v == true;

/// 是对象就转成 Json，否则当作空对象（插件返回的类型不对时不抛）。
Json _map(Object? v) =>
    v is Map ? v.cast<String, dynamic>() : <String, dynamic>{};

List<T> _list<T>(Object? v, T Function(Json) f) => v is List
    ? [
        for (final e in v)
          if (e is Map) f(e.cast<String, dynamic>()),
      ]
    : <T>[];

/// 去掉空值，对应 Go 的 omitempty。
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

  /// 版权行，原样显示在专辑页底部，例如 ℗ 2022 XX Records。不知道为空。
  final String copyright;

  /// album、single、ep、compilation；不知道为空（当作专辑）。
  final String kind;
  final int trackCount;

  /// 源给出的原样字符串，例如 2024-03-01 或 2024。
  final String released;
  final bool saved;

  /// 加进音乐库的时间，ISO 8601（2024-03-01 或带时刻）。不知道就是空。
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

  /// 来源的 id。源自己返回时可以不填，由 [Sources] 统一补上。
  final String source;
  final List<Artist> artists;
  final Album album;

  /// 毫秒。
  final int duration;

  /// 歌曲在来源处的网页，用于分享。
  final String url;
  final bool unavailable;

  // 播客单集也是 Track。
  final String showId, description, published;

  /// 加进音乐库的时间，ISO 8601。不知道就是空。
  final String added;

  /// 全局唯一键：同一个 id 在不同源里是不同的歌。
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

  /// 播放次数；0 表示不知道，卡片上就不显示。
  final int plays;

  /// 卡片上标题下面的一行（播放次数、简介…）；空的时候界面用创建者和歌曲数。
  final String subtitle;
  final int trackCount;

  /// 用户自己的歌单。
  final bool mine;

  /// 收藏的别人的歌单。
  final bool saved;

  /// 用户的、但由源维护（比如"我喜欢的音乐"），不能改名、删除、增删歌曲。
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

  /// 相似歌手。
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

  /// 用户自己的 browse 页（"我的主页"）。
  final String page;

  factory Account.fromJson(Json j) => Account(
    id: _s(j['id']),
    name: _s(j['name']),
    imageUrl: _s(j['imageUrl']),
    page: _s(j['page']),
  );
}

/// 个人主页（profile 操作）：账号资料、统计、听得最多的艺人和歌、自己的歌单。
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

  /// 名字下面的小标签，比如「Lv.9」「黑胶 VIP」。
  final List<String> badges;

  /// 名字下面的几项资料，比如（关注, 32）。
  final List<({String label, String value})> facts;

  /// 统计卡片，最多显示前三个。
  final List<ProfileStat> stats;
  final List<({Artist artist, int plays})> topArtists;

  /// 听歌排行的标题，比如「最近一周最常听」。
  final String topTitle;
  final List<({Track track, int plays})> topTracks;

  /// 自己创建的歌单。
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

  /// 点卡片去音乐库的哪个标签：songs、albums、playlists、artists；空的不能点。
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

  /// 还有下一页。
  final bool more;

  /// 一共有多少条（源知道的话）；0 表示不知道。
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

/// 一页歌曲。
class TrackPage {
  const TrackPage({this.tracks = const [], this.more = false});
  final List<Track> tracks;
  final bool more;

  factory TrackPage.fromJson(Json j) => TrackPage(
    tracks: _list(j['tracks'], Track.fromJson),
    more: _b(j['more']),
  );
}

/// 歌曲下面的一条评论。回复别人的评论也是一条普通评论，[replyTo] 是被回复的那条
/// （界面上在正文下面引用它，不做楼中楼）。
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

  /// 发表时间，毫秒时间戳；0 表示不知道。
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

/// 被回复的那条评论：谁说的、说了什么。
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

/// 一页评论。[total] 是这首歌的评论总数（不知道时 0），[more] 表示还能往下翻。
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

/// 源自己组织的页面：首页，以及从链接、导航打开的页面。
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

  /// 页面顶部的一排 tab（比如 精选、歌单广场、排行榜…）。点了用它的 page 再取一次。
  final List<Choice> tabs;

  /// tab 下面的子 tab：一排或几排标签（比如歌手的 地区、类型、首字母）。
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

/// 页面上的一个选项（tab 或标签）。有 [groups] 时点开是分组菜单（比如「更多分类」）。
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

  /// 顶部组卡右边叠的封面（最多三张）。
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

  /// 用哪个首页组件显示：
  /// - `modes`：特殊模式（[modes]）。前两个是大卡片，其余是小行。
  /// - `shelf`：卡片，超过一屏时排两行、横向滚动。
  /// - `songs`：歌曲翻页网格（3 列 × 4 行）。
  /// - `charts`：排行榜卡片，歌单的 tracks 是前几名。
  /// - `grid`：卡片铺满一行、往下排（歌单、专辑、歌手）。
  /// 空的或不认识的：按原来的列表和卡片显示。
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

/// 特殊模式：一组每天更新的歌（[tracks]）、一个歌单（[playlist]）或一个电台（[station]）。
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

  /// 标题上面的小字，比如「每天 6:00 更新」。
  final String note;
  final String imageUrl;
  final List<Track> tracks;

  /// 歌单 id：点开是歌单页，播放按钮放整个歌单。
  final String playlist;

  /// 电台 id：交给 [Source.station] 一批一批地取歌。
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

/// 交给播放器播放的音频。
class AudioStream {
  const AudioStream({
    required this.url,
    required this.type,
    this.quality = '',
    this.bitRate = 0,
    this.size = 0,
    this.peak = 0,
    this.gain = 0,
    this.headers = const {},
  });

  /// http(s):// 或 file://。
  final String url;

  /// mp3, flac, ogg, wav, m4a, aac…
  final String type;
  final String quality;
  final int bitRate, size;
  final double peak, gain;
  final Map<String, String> headers;

  factory AudioStream.fromJson(Json j) => AudioStream(
    url: _s(j['url']),
    type: _s(j['type']),
    quality: _s(j['quality']),
    bitRate: _i(j['bitRate']),
    size: _i(j['size']),
    peak: _d(j['peak']),
    gain: _d(j['gain']),
    headers: j['headers'] is Map
        ? {
            for (final e in (j['headers'] as Map).entries)
              '${e.key}': '${e.value}',
          }
        : const {},
  );
}

/// 歌词：可以是 LRC 文本，也可以是逐行（可逐字）的 [lines]，有 lines 时优先用它。
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

/// 歌曲怎么被听到：stream 交给本应用播放；remote 在别处播放（如 Apple Music、
/// Spotify Connect），本应用只负责遥控。
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

  /// text、password、boolean、select；不认识的当 text。值始终是字符串。
  final String type;

  /// 未保存过时的默认值（比如 boolean 写 "true" 默认开启）。
  final String defaultValue;

  /// boolean 开关对应的可选能力（比如 "comments"），关掉时视为不支持该能力。
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

/// 侧边栏条目：源自己的 browse 页（[page]），或应用内置页（[builtin]：
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

/// 源的自我介绍；插件的 plugin.json 也是这个形状（外加 main、permissions 等）。
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

/// 音质档位，从低到高。源可以有别的档位或没有档位，按它自己有的返回。
const qualities = ['standard', 'high', 'lossless'];

/// 一条热门搜索：词，加上一句可选的说明。
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

/// 插件加在歌曲右键菜单里的一项。点了调插件的 menuAction。
class MenuEntry {
  const MenuEntry({
    required this.id,
    required this.title,
    this.icon = '',
    this.danger = false,
  });
  final String id, title;

  /// 应用自带图标的名字（如 radio、music、arrow-right）；空或不认识时用默认图标。
  final String icon;
  final bool danger;

  factory MenuEntry.fromJson(Json j) => MenuEntry(
    id: _s(j['id']),
    title: _s(j['title']),
    icon: _s(j['icon']),
    danger: _b(j['danger']),
  );
}

/// 插件对一首歌右键菜单的定制：加的条目，和要藏起来的自带条目。
class TrackMenu {
  const TrackMenu({this.items = const [], this.hide = const {}});
  final List<MenuEntry> items;

  /// 自带条目的名字：play、next、queue、like、addToPlaylist、album、artist、
  /// similar、dislike、remove。
  final Set<String> hide;

  /// 插件可以直接返回条目数组，也可以返回 {items, hide}。
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

/// 插件执行完菜单项后要应用做的事，都可以没有。
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

  /// 提示一句话。
  final String toast;

  /// 复制到剪贴板的文字（比如分享链接）。
  final String copy;

  /// 打开页面：kind 为 album、artist、playlist。
  final String openKind, openId;

  /// 播放这些歌，[name] 显示在「正在播放 · 来自 …」。
  final List<Track> tracks;
  final String name;

  /// 放这个电台（插件 station 的 id），[seed] 为起点歌曲。
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
