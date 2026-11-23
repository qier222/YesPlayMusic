// 插件返回的 JSON 不可信：字段类型写错时解析不能抛异常，否则整页白屏。
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart';

const _keys = [
  'added',
  'album',
  'albums',
  'artist',
  'artists',
  'badges',
  'bitRate',
  'builtin',
  'comments',
  'copy',
  'danger',
  'description',
  'duration',
  'empty',
  'end',
  'facts',
  'filters',
  'fixed',
  'following',
  'gain',
  'groups',
  'headers',
  'help',
  'hide',
  'icon',
  'id',
  'imageUrl',
  'images',
  'items',
  'key',
  'kind',
  'label',
  'liked',
  'likes',
  'lines',
  'link',
  'links',
  'lrc',
  'mine',
  'modes',
  'more',
  'morePage',
  'name',
  'navigation',
  'note',
  'open',
  'options',
  'owner',
  'page',
  'pageTitle',
  'peak',
  'playback',
  'playlist',
  'playlists',
  'plays',
  'published',
  'quality',
  'related',
  'released',
  'replyTo',
  'saved',
  'sections',
  'selected',
  'settings',
  'showId',
  'signature',
  'size',
  'source',
  'start',
  'station',
  'stats',
  'style',
  'subtitle',
  'tabs',
  'text',
  'time',
  'title',
  'toast',
  'topArtists',
  'topTracks',
  'total',
  'trackCount',
  'tracks',
  'translation',
  'type',
  'unavailable',
  'unit',
  'url',
  'user',
  'userName',
  'value',
  'version',
  'words',
];

/// 各种写错的值：字符串、数字、布尔、空、列表（含杂项）、对象。
const List<Object?> _wrong = [
  'x',
  '12.5',
  -1,
  1.5,
  1e20,
  true,
  null,
  <Object?>[],
  <Object?>[1, 'a', null, true, <Object?>[]],
  <String, Object?>{},
  <String, Object?>{'id': 1, 'name': <Object?>[]},
];

final Map<String, Object? Function(Map<String, dynamic>)> _parsers = {
  'Artist': Artist.fromJson,
  'Album': Album.fromJson,
  'Track': Track.fromJson,
  'Playlist': Playlist.fromJson,
  'AlbumPage': AlbumPage.fromJson,
  'ArtistPage': ArtistPage.fromJson,
  'Account': Account.fromJson,
  'Profile': Profile.fromJson,
  'ProfileStat': ProfileStat.fromJson,
  'SearchResult': SearchResult.fromJson,
  'TrackPage': TrackPage.fromJson,
  'Comment': Comment.fromJson,
  'CommentQuote': CommentQuote.fromJson,
  'CommentPage': CommentPage.fromJson,
  'Browse': Browse.fromJson,
  'Choice': Choice.fromJson,
  'ChoiceGroup': ChoiceGroup.fromJson,
  'Section': Section.fromJson,
  'Mode': Mode.fromJson,
  'Link': Link.fromJson,
  'AudioStream': AudioStream.fromJson,
  'Lyrics': Lyrics.fromJson,
  'LyricLine': LyricLine.fromJson,
  'LyricWord': LyricWord.fromJson,
  'Setting': Setting.fromJson,
  'NavItem': NavItem.fromJson,
  'SourceInfo': SourceInfo.fromJson,
  'MenuEntry': MenuEntry.fromJson,
  'TrackMenu': TrackMenu.fromJson,
  'MenuResult': MenuResult.fromJson,
  'HotSearch.listFrom': HotSearch.listFrom,
};

void main() {
  for (final MapEntry(key: name, value: parse) in _parsers.entries) {
    test('$name：任意字段类型写错都不抛', () {
      final failures = <String>[];
      expect(() => parse(<String, dynamic>{}), returnsNormally);
      for (final k in _keys) {
        for (final v in _wrong) {
          try {
            parse(<String, dynamic>{k: v});
            // 嵌在列表里的对象也写错
            parse(<String, dynamic>{
              k: [
                {k: v},
              ],
            });
          } catch (e) {
            failures.add('$k=$v → ${e.runtimeType}');
          }
        }
      }
      // 所有字段一起写错
      for (final v in _wrong) {
        try {
          parse({for (final k in _keys) k: v});
        } catch (e) {
          failures.add('all=$v → ${e.runtimeType}');
        }
      }
      expect(failures, isEmpty, reason: failures.take(20).join('\n'));
    });
  }
}
