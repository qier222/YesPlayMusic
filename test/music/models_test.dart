import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart';

void main() {
  // 插件返回的 JSON（MyGo 插件协议的形状）能直接解析：嵌套对象、
  // 字符串形式的数字、缺省字段都要容忍。
  test('parses plugin-shaped album page', () {
    final page = AlbumPage.fromJson({
      'album': {
        'id': 'a1',
        'name': 'SOS',
        'artists': [
          {'id': 'sza', 'name': 'SZA'},
        ],
        'released': '2022-12-09',
      },
      'tracks': [
        {
          'id': 't1',
          'name': 'Kill Bill',
          'artists': [
            {'id': 'sza', 'name': 'SZA'},
          ],
          'album': {'id': 'a1', 'name': 'SOS'},
          'duration': '153947',
        },
        {'id': 't2', 'name': 'Snooze', 'unavailable': true},
        'not an object',
      ],
    });
    expect(page.album.year, 2022);
    expect(page.tracks.map((t) => (t.id, t.duration, t.unavailable)), [
      ('t1', 153947, false),
      ('t2', 0, true),
    ]);
    expect(page.tracks.first.artistNames, 'SZA');
  });

  // 同一个 id 在不同源里是不同的歌，key 要带上源。
  test('track key includes source', () {
    const t = Track(id: '1', name: 'x');
    expect(t.withSource('demo').key, isNot(t.withSource('other').key));
  });

  // toJson 省略空值，fromJson 读回来不丢字段。
  test('track json round trip omits empties', () {
    const t = Track(
      id: '1',
      name: 'Moon River',
      source: 'local',
      artists: [Artist(id: 'f', name: 'Frank Ocean')],
      album: Album(id: 'a', name: 'Neon Nights', released: '2018'),
      duration: 188000,
    );
    final j = t.toJson();
    expect(j.containsKey('unavailable'), isFalse);
    expect(j.containsKey('url'), isFalse);
    final back = Track.fromJson(j);
    expect(
      (back.key, back.artistNames, back.album.year, back.duration),
      (t.key, t.artistNames, 2018, 188000),
    );
  });

  // plugin.json 的 playback/settings/navigation 解析，不认识的设置类型按 text。
  test('source info from manifest', () {
    final info = SourceInfo.fromJson({
      'id': 'example',
      'name': 'Example',
      'playback': 'remote',
      'settings': [
        {'key': 'apiKey', 'label': 'API Key'},
        {
          'key': 'q',
          'label': 'Quality',
          'type': 'select',
          'options': [
            {'value': 'hi', 'label': 'High'},
          ],
        },
      ],
      'navigation': [
        {'builtin': 'home'},
        {'title': 'Charts', 'page': 'charts', 'icon': 'chart'},
      ],
    });
    expect(info.playback, Playback.remote);
    expect(info.settings.map((s) => s.type), ['text', 'select']);
    expect(info.settings.last.options.single.value, 'hi');
    expect(info.navigation.last.page, 'charts');
  });

  test('home sections carry a style and special modes', () {
    final b = Browse.fromJson({
      'sections': [
        {
          'style': 'modes',
          'modes': [
            {
              'title': '每日推荐',
              'note': '每天 6:00 更新',
              'tracks': [
                {'id': '1', 'name': 'A'},
              ],
            },
            {'title': '私人漫游', 'station': 'fm'},
            {'title': '私人雷达', 'playlist': '42'},
          ],
        },
        {
          'title': '推荐歌单',
          'style': 'shelf',
          'playlists': [
            {'id': 'p', 'name': 'P', 'subtitle': '2.7 万次播放'},
          ],
        },
      ],
    });
    final modes = b.sections.first.modes;
    expect(b.sections.first.style, 'modes');
    expect(modes.map((m) => m.title), ['每日推荐', '私人漫游', '私人雷达']);
    expect(modes[0].note, '每天 6:00 更新');
    expect(modes[0].tracks.single.name, 'A');
    expect(modes[1].station, 'fm');
    expect(modes[2].playlist, '42');
    expect(b.sections.last.playlists.single.subtitle, '2.7 万次播放');
  });

  test('track menu and menu results from plugins', () {
    final list = TrackMenu.fromJson([
      {'id': 'a', 'title': '复制链接', 'icon': 'arrow-right'},
    ]);
    expect(list.items.single.title, '复制链接');
    expect(list.hide, isEmpty);

    final full = TrackMenu.fromJson({
      'hide': ['similar'],
      'items': [
        {'id': 'b', 'title': '删除', 'danger': true},
      ],
    });
    expect(full.hide, {'similar'});
    expect(full.items.single.danger, isTrue);
    expect(TrackMenu.fromJson(null).items, isEmpty);

    final r = MenuResult.fromJson({
      'copy': 'https://x',
      'open': {'kind': 'artist', 'id': 7},
      'station': {'id': 'similar', 'seed': '9'},
    });
    expect(r.copy, 'https://x');
    expect((r.openKind, r.openId), ('artist', '7'));
    expect((r.station, r.seed), ('similar', '9'));
    expect(MenuResult.fromJson('nope').toast, '');
  });

  test('hot searches from plugins', () {
    final hs = HotSearch.listFrom([
      {'word': '晚风', 'hint': '新歌'},
      {'word': ''},
      '稻香',
      3,
    ]);
    expect(hs.map((h) => h.word), ['晚风', '稻香']);
    expect(hs.first.hint, '新歌');
    expect(HotSearch.listFrom(null), isEmpty);
  });
}
