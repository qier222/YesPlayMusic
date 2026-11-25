import 'package:flutter/widgets.dart';

import 'data.dart';
import 'l10n/l10n.dart';
import 'music/source.dart' show Op;
import 'pages/common.dart' show askName;
import 'state.dart';
import 'ui.dart';

// Context menus: songs, albums, playlists.

/// Song context menu. [playlist] is the id of the user's own playlist the menu was opened in (songs can be removed from it);
/// [onRemoved] is called after removal so the playlist page can drop the row.
///
/// Songs from a source: built-in items appear according to the ops the source supports; plugins can also use trackMenu
/// to add their own items (calling menuAction when clicked) and hide built-in items by id.
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
  // What the menu acts on is the song itself: use the song data the plugin gave directly
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
    // Plugin items go after the "go to" group and before delete
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
                if (p.id != playlist)
                  MenuItem(
                    'music',
                    p.name,
                    onTap: () => app.addToPlaylist(t, p),
                  ),
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
        // Only songs from a station can be disliked (tells the station to recommend them less)
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

/// Built-in icon names; plugin items can only use these.
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

/// Album menu: play, shuffle, save (when the source supports it), view artist.
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

/// Playlist menu: play, shuffle. [onPlay] puts the playlist in the queue and starts playing.
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

// ───── Sleep timer ─────

/// Durations offered in the menu (minutes).
const sleepPresets = [15, 30, 45, 60, 90];

/// Time left: 1:05:09, 23:41.
String formatSleepLeft(Duration d) {
  final s = d.inSeconds;
  String two(int n) => n.toString().padLeft(2, '0');
  final h = s ~/ 3600, m = s % 3600 ~/ 60, sec = s % 60;
  return h > 0 ? '$h:${two(m)}:${two(sec)}' : '${two(m)}:${two(sec)}';
}

/// The "more" menu at the bottom right of Now Playing. Other playback options go here too.
MenuSpec npMoreMenu(BuildContext context) => MenuSpec(
  groups: [
    [sleepMenuItem(context)],
  ],
);

/// Sleep timer (a submenu, no icons): common durations, custom, after this track;
/// while it's on, the last group turns it off and shows the time left.
MenuItem sleepMenuItem(BuildContext context) {
  final app = context.appRead;
  final l = context.l10n;
  void start(int minutes) {
    app.setSleepTimer(Duration(minutes: minutes));
    showToast(l.toastSleepIn(minutes));
  }

  final left = app.sleepLeft;
  return MenuItem(
    '',
    l.sleepTimer,
    checked: app.sleepOn,
    subGroups: [
      [
        for (final n in sleepPresets)
          MenuItem('', l.sleepMinutes(n), onTap: () => start(n)),
        MenuItem(
          '',
          l.sleepCustom,
          onTap: () async {
            final v = await askName(
              context,
              title: l.sleepCustomTitle,
              placeholder: l.sleepCustomPlaceholder,
              action: l.sleepCustomAction,
              icon: 'clock',
              maxLength: 3,
            );
            final n = int.tryParse(v?.trim() ?? '');
            if (n != null && n > 0) start(n.clamp(1, 720));
          },
        ),
      ],
      [
        MenuItem(
          '',
          l.sleepAfterTrack,
          checked: app.sleepAfterTrack,
          onTap: () {
            app.setSleepAfterTrack();
            showToast(l.toastSleepAfterTrack);
          },
        ),
      ],
      if (app.sleepOn)
        [
          MenuItem(
            '',
            left == null
                ? l.sleepOff
                : '${l.sleepOff} · ${l.sleepLeft(formatSleepLeft(left))}',
            onTap: () {
              app.setSleepTimer(null);
              showToast(l.toastSleepOff);
            },
          ),
        ],
    ],
  );
}
