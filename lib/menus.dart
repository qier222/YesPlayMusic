import 'package:flutter/widgets.dart';

import 'data.dart';
import 'l10n/l10n.dart';
import 'music/source.dart' show Op;
import 'pages/common.dart' show askName;
import 'state.dart';
import 'ui.dart';

// 右键菜单：歌曲、专辑、歌单。

/// 歌曲右键菜单。[playlist] 是右键时所在、而且是自己的歌单 id（能从里面删歌）；
/// [onRemoved] 在删掉之后调用，让歌单页把这一行拿掉。
///
/// 来源里的歌：应用自带的条目按源支持的操作出现，插件还可以用 trackMenu
/// 加自己的条目（点了调 menuAction）、按 id 藏起自带的条目。
MenuSpec trackMenu(
  BuildContext context,
  Track t, {
  String playlist = '',
  VoidCallback? onRemoved,
}) {
  final r = t.ref;
  if (r == null) return const MenuSpec(groups: []);
  final app = context.appRead;
  final l = context.l10n;
  final s = app.sources[r.source];
  bool can(String op) => s?.can(op) ?? false;
  final liked = app.liked.contains(t.key);
  final albumRoute = app.albumRouteOf(t);
  final artists = [
    for (final a in r.artists)
      if (app.artistRouteFor(r.source, a.id) case final route?) (a.name, route),
  ];
  // 菜单里能选中的是歌本身：直接用插件给的歌曲数据
  Future<MenuMore>? more;
  if (can(Op.trackMenu)) {
    more = s!
        .trackMenu(r, playlist: playlist)
        .timeout(const Duration(seconds: 2))
        .then(
          (m) => (
            groups: [
              [
                for (final e in m.items)
                  if (e.id.isNotEmpty && e.title.isNotEmpty)
                    MenuItem(
                      _icons.contains(e.icon) ? e.icon : 'plugin',
                      e.title,
                      danger: e.danger,
                      onTap: () => app.runMenuAction(e, t, playlist: playlist),
                    ),
              ],
            ],
            hide: m.hide,
          ),
        );
  }
  return MenuSpec(
    title: t.title,
    subtitle: t.artist,
    cover: t.cover,
    more: more,
    // 插件的条目放在「去哪儿」那组之后、删除之前
    moreAt: 3,
    groups: [
      [
        MenuItem(
          'play',
          l.actionPlay,
          id: 'play',
          onTap: () => app.playTrack(t),
        ),
        MenuItem(
          'next',
          l.menuPlayNext,
          id: 'next',
          onTap: () {
            app.addNext(t);
            showToast(l.menuAddedNext);
          },
        ),
        MenuItem(
          'queue',
          l.menuAddToQueue,
          id: 'queue',
          onTap: () {
            app.addToQueue(t);
            showToast(l.menuAddedToQueue);
          },
        ),
      ],
      [
        if (can(Op.like))
          MenuItem(
            liked ? 'heart-filled' : 'heart',
            liked ? l.actionUnlike : l.actionLike,
            id: 'like',
            onTap: () => app.toggleLike(t),
          ),
        if (can(Op.addToPlaylist))
          MenuItem(
            'plus',
            l.menuAddToPlaylist,
            id: 'addToPlaylist',
            subSplit: can(Op.createPlaylist),
            subLoad: () async => [
              if (can(Op.createPlaylist))
                MenuItem(
                  'plus',
                  l.menuCreatePlaylist,
                  onTap: () async {
                    final name = await askName(
                      context,
                      title: l.menuCreatePlaylist,
                      placeholder: l.menuPlaylistNamePlaceholder,
                      action: l.menuCreateAndAdd,
                    );
                    if (name != null) app.createPlaylistWith(t, name);
                  },
                ),
              for (final p in await app.editablePlaylists(r.source))
                MenuItem('music', p.name, onTap: () => app.addToPlaylist(t, p)),
            ],
          ),
      ],
      [
        if (albumRoute != null)
          MenuItem(
            'music',
            l.npViewAlbum,
            id: 'album',
            onTap: () => app.open(albumRoute),
          ),
        if (artists.length == 1)
          MenuItem(
            'user',
            l.npViewArtist,
            id: 'artist',
            onTap: () => app.open(artists.first.$2),
          )
        else if (artists.length > 1)
          MenuItem(
            'user',
            l.npViewArtist,
            id: 'artist',
            subSplit: false,
            sub: [
              for (final (name, route) in artists)
                MenuItem('user', name, onTap: () => app.open(route)),
            ],
          ),
        if (can(Op.similar))
          MenuItem(
            'broadcast',
            l.menuPlaySimilar,
            id: 'similar',
            onTap: () => app.playSimilar(t),
          ),
        // 只有电台里的歌能「不喜欢」（告诉电台以后少推荐）
        if (app.canDislike(t) &&
            app.station?.$1 == r.source &&
            app.queue.any((x) => x.key == t.key))
          MenuItem(
            'thumbs-down',
            l.menuDislike,
            id: 'dislike',
            onTap: () => app.dislike(t),
          ),
      ],
      [
        if (playlist.isNotEmpty && can(Op.removeFromPlaylist))
          MenuItem(
            'close',
            l.menuRemoveFromPlaylist,
            id: 'remove',
            danger: true,
            onTap: () async {
              if (await app.removeFromPlaylist(t, playlist)) onRemoved?.call();
            },
          ),
      ],
    ],
  );
}

/// 应用自带的图标名，插件条目只能用这些。
const _icons = {
  'arrow-left',
  'arrow-right',
  'broadcast',
  'check-circle',
  'check',
  'clock',
  'close', //
  'compass', 'edit', 'grid', 'heart-filled', 'heart', 'home',
  'info',
  'library',
  'mcp',
  'more',
  'music',
  'mute',
  'next',
  'pause',
  'play',
  'plugin',
  'plus-circle', 'plus', 'previous', 'queue', 'repeat', 'search',
  'settings', 'shuffle', 'thumbs-down', 'trending', 'user', 'volume',
};

/// 专辑的菜单：播放、随机播放、收藏（源支持时）、查看艺人。
MenuSpec albumMenu(BuildContext context, Album al) {
  final app = context.appRead;
  final l = context.l10n;
  final i = al.id.indexOf('/');
  final src = al.id.startsWith('@') && i > 1
      ? app.sources[al.id.substring(1, i)]
      : null;
  final saved = app.savedAlbums.contains(al.id);
  return MenuSpec(
    title: al.title,
    subtitle: al.artist,
    cover: al.cover,
    groups: [
      [
        MenuItem('play', l.actionPlay, onTap: () => app.playAlbumById(al.id)),
        MenuItem(
          'shuffle',
          l.actionShuffle,
          onTap: () async {
            await app.playAlbumById(al.id);
            if (!app.shuffle) app.toggleShuffle();
          },
        ),
      ],
      [
        if (src != null && src.can(Op.saveAlbum))
          MenuItem(
            saved ? 'heart-filled' : 'heart',
            saved ? l.actionUnsave : l.actionSaveAlbum,
            onTap: () => app.toggleSaveAlbum(al),
          ),
        if (al.artistRoute.isNotEmpty)
          MenuItem(
            'user',
            l.npViewArtist,
            onTap: () => app.open(al.artistRoute),
          ),
      ],
    ],
  );
}

/// 歌单的菜单：播放、随机播放。[onPlay] 把歌单放进队列并开始播放。
MenuSpec playlistMenu(
  BuildContext context, {
  required String title,
  required String meta,
  required String cover,
  required Future<void> Function() onPlay,
}) {
  final app = context.appRead;
  final l = context.l10n;
  return MenuSpec(
    title: title,
    subtitle: meta,
    cover: cover,
    groups: [
      [
        MenuItem('play', l.actionPlay, onTap: onPlay),
        MenuItem(
          'shuffle',
          l.actionShuffle,
          onTap: () async {
            await onPlay();
            if (!app.shuffle) app.toggleShuffle();
          },
        ),
      ],
    ],
  );
}
