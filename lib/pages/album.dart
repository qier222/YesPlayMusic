import 'package:flutter/widgets.dart';

import '../data.dart';
import '../cache/requests.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../shell.dart' show MiniPlayer;
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'library.dart' show HeartSmall;

// Text on the right sits on a background taken from the cover, where solid gray clashes with the cover color; use white / black + opacity instead,
// which on pure black (light theme: pure white) matches the original P.muted / P.faint gray.
Color get _muted =>
    P.dark ? wa(161 / 255) : ba(1 - 82 / 255); // #A1A1AA / #52525B
Color get _faint =>
    P.dark ? wa(133 / 255) : ba(1 - 113 / 255); // #85858F / #71717A

class AlbumPage extends StatelessWidget {
  const AlbumPage({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final al = app.albumOf(id);
    if (al == null) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(40, 20, 40, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BackBtn(onTap: app.back),
            const SizedBox(height: 48),
            tx(l.albumNotFound, 15, w: w600, c: P.faint),
          ],
        ),
      );
    }
    final saved = app.savedAlbums.contains(al.id);
    final kind = al.kind.isEmpty ? l.albumKindAlbum : al.kind;
    final rows = [
      for (final t in app.albumTracks(al.id) ?? const <Track>[]) (t, ''),
    ];
    final minutes = (rows.fold(0, (a, r) => a + r.$1.seconds) / 60).round();
    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Extend 96 to the left (sidebar 72 + page slide 24) and 24 to the right: the background reaches the window's
        // left edge, shows under the translucent sidebar, and fades and slides with the page, so no edge shows during page changes.
        Positioned(
          left: -96,
          right: -24,
          top: 0,
          bottom: 0,
          child: CoverWash(coverId: al.cover),
        ),
        Positioned.fill(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 400,
                  child: Padding(
                    padding: EdgeInsets.only(
                      bottom: app.hasQueue ? MiniPlayer.bottomInset : 0,
                    ),
                    child: SingleChildScrollView(
                      primary: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),
                          BackBtn(onTap: app.back),
                          const SizedBox(height: 36),
                          FadeIn(
                            dy: 20,
                            child: Container(
                              decoration: squircle(
                                20,
                                shadows: [
                                  BoxShadow(
                                    color: ba(0.67),
                                    blurRadius: 60,
                                    offset: const Offset(0, 24),
                                    spreadRadius: -10,
                                  ),
                                ],
                              ),
                              child: Cover(al.cover, w: 400, h: 400, r: 20),
                            ),
                          ),
                          const SizedBox(height: 16),
                          tx(
                            al.year > 0 ? '$kind · ${al.year}' : kind,
                            13,
                            w: w700,
                            f: F.semi,
                            c: _muted,
                          ),
                          const SizedBox(height: 8),
                          Transform.translate(
                            offset: const Offset(-3, 0),
                            child: SizedBox(
                              width: 440,
                              child: tx(
                                al.title,
                                al.title.length > 9 ? 44 : 72,
                                w: w900,
                                f: F.wide,
                                lines: 2,
                                h: 1.05,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Tap(
                            onTap: al.artistRoute.isEmpty
                                ? null
                                : () => app.go(al.artistRoute),
                            builder: (_, h, _) => Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _AlbumArtistAvatar(
                                  image: al.artistImage,
                                  route: al.artistRoute,
                                ),
                                const SizedBox(width: 10),
                                AnimatedDefaultTextStyle(
                                  duration: fast,
                                  style: ts(
                                    15,
                                    w: w700,
                                    f: F.semi,
                                    c: h ? accent : P.ink,
                                  ),
                                  child: CjkText(al.artist),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              PlayPill(
                                onTap: () =>
                                    app.playAlbum(al.id, shuffled: false),
                              ),
                              const SizedBox(width: 10),
                              RoundBtn(
                                icon: 'shuffle',
                                tip: l.actionShuffle,
                                onTap: (_) =>
                                    app.playAlbum(al.id, shuffled: true),
                              ),
                              const SizedBox(width: 10),
                              RoundBtn(
                                icon: saved ? 'heart-filled' : 'heart',
                                tip: saved ? l.actionUnsave : l.actionSaveAlbum,
                                on: saved,
                                onTap: (_) => app.toggleSaveAlbum(al),
                              ),
                              const SizedBox(width: 10),
                              RoundBtn(
                                icon: 'more',
                                tip: l.actionMore,
                                onTap: (ctx) =>
                                    menuBelow(ctx, albumMenu(ctx, al)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 64),
                // Same as the playlist page: the header stays fixed, only the tracks below scroll
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 96),
                      SizedBox(
                        height: 28,
                        child: Row(
                          children: [
                            tx(l.albumTracksTitle, 20, w: w700, f: F.semi),
                            const Spacer(),
                            tx(
                              l.albumTracksDuration(rows.length, minutes),
                              13,
                              w: w600,
                              c: _faint,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(height: 1, color: P.line),
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.only(top: 12, bottom: 200),
                          itemCount: rows.length + 1,
                          itemBuilder: (_, i) => i < rows.length
                              ? Padding(
                                  padding: const EdgeInsets.only(bottom: 2),
                                  child: FadeIn(
                                    delay: (i < 14 ? i : 14) * 20,
                                    child: _AlbumTrackRow(
                                      i: i,
                                      track: rows[i].$1,
                                      feat: rows[i].$2,
                                      album: al,
                                    ),
                                  ),
                                )
                              : Padding(
                                  padding: const EdgeInsets.only(top: 22),
                                  child: tx(
                                    _footer(al, l),
                                    12,
                                    w: w500,
                                    c: _faint,
                                    lines: null,
                                    h: 1.67,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Bottom of the list: release date (just the year when only the year is known), copyright on the next line.
String _footer(Album al, AppLocalizations l) {
  final d = al.released;
  final date = d != null
      ? l.albumReleasedOn(l.dateYearMonthDay(d.year, d.month, d.day))
      : al.year > 0
      ? l.albumReleasedIn(al.year)
      : '';
  return [date, al.copyright].where((s) => s.isNotEmpty).join('\n');
}

class _AlbumArtistAvatar extends StatefulWidget {
  const _AlbumArtistAvatar({required this.image, required this.route});
  final String image, route;

  @override
  State<_AlbumArtistAvatar> createState() => _AlbumArtistAvatarState();
}

class _AlbumArtistAvatarState extends State<_AlbumArtistAvatar> {
  String? _target;
  Future<m.ArtistPage>? _request;

  Widget _avatar(String image) => image.isNotEmpty
      ? Cover(image, w: 28, h: 28, r: 14)
      : Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: squircle(14, color: P.raised),
          child: Ico('user', size: 16, color: _faint),
        );

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    // Use the same artist identity as the adjacent navigation link. Album responses
    // often omit the avatar or supply the service's generic artist image.
    final parts = Uri.tryParse(widget.route)?.pathSegments ?? const <String>[];
    if (parts.length != 3 ||
        parts[0] != 'artist' ||
        !parts[1].startsWith('@')) {
      return _avatar(widget.image);
    }
    final source = parts[1].substring(1), artist = parts[2];
    if (artist.isEmpty || !(app.sources[source]?.can(Op.artist) ?? false)) {
      return _avatar(widget.image);
    }
    final target = '${app.cacheSpace(source)}/$artist';
    if (_target != target) {
      _target = target;
      _request = null;
    }
    final req = DataReq.artist(source, artist);
    _request ??= app.getData(req);
    return FutureBuilder<m.ArtistPage>(
      key: ValueKey(target),
      future: _request,
      builder: (context, snapshot) {
        final image =
            (app.peekData(req) ?? snapshot.data)?.artist.imageUrl ?? '';
        return _avatar(image.isNotEmpty ? image : widget.image);
      },
    );
  }
}

class _AlbumTrackRow extends StatelessWidget {
  const _AlbumTrackRow({
    required this.i,
    required this.track,
    required this.feat,
    required this.album,
  });
  final int i;
  final Track track;
  final String feat;
  final Album album;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final current = app.track.key == track.key;
    void play() =>
        current ? app.togglePlay() : app.playAlbum(album.id, start: i);
    return Tap(
      onDoubleTap: play,
      onMenu: (p) => showMenu(context, p, trackMenu(context, track)),
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(
          12,
          color: current
              ? (P.dark ? wa(0.08) : ba(0.05))
              : (h ? (P.dark ? wa(0.05) : ba(0.03)) : const Color(0x00000000)),
        ),
        child: Row(
          children: [
            RowIndex(
              n: i + 1,
              hover: h,
              current: current,
              playing: app.playing,
              width: 26,
              align: Alignment.center,
              color: _faint,
              onTap: play,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Flexible(
                    child: tx(
                      track.title,
                      15,
                      w: w700,
                      c: current ? accent : P.ink,
                    ),
                  ),
                  if (feat.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    Flexible(
                      child: tx(feat, 12, w: w500, c: _muted),
                    ),
                  ],
                ],
              ),
            ),
            if (h || app.liked.contains(track.key)) ...[
              HeartSmall(
                liked: app.liked.contains(track.key),
                onTap: () => app.toggleLike(track),
                color: _faint,
              ),
              const SizedBox(width: 8),
            ],
            tx(track.dur, 13, w: w600, c: _faint, tnum: true),
          ],
        ),
      ),
    );
  }
}
