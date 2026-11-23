import 'package:flutter/widgets.dart';

import '../cache/requests.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'remote.dart' show Loaded, Notice;
import 'settings.dart' show openPluginSettings;

/// 个人主页：当前音乐源登录账号的资料、统计、听歌排行和自己的歌单（profile 操作）。
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final s = app.remote ? app.sources[app.sourceId] : null;
    Widget page(List<Widget> children) => SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(40, 20, 40, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BackBtn(onTap: app.back),
          ...children,
        ],
      ),
    );
    if (s == null || !s.can(Op.profile)) {
      return page([
        Notice(
          s == null
              ? l.profileLocalUnsupported
              : l.profileSourceUnsupported(s.info.name),
          action: l.actionManageSources,
          onAction: () => openPluginSettings(app),
        ),
      ]);
    }
    if (app.accounts[s.id] == null && s.can(Op.signIn)) {
      return page([
        Notice(
          l.profileSignInHint(s.info.name),
          action: app.signingIn.contains(s.id)
              ? l.stateSigningIn
              : l.actionSignIn,
          onAction: () => app.signIn(s),
        ),
      ]);
    }
    return Loaded<m.Profile>(
      req: DataReq.profile(s.id),
      placeholder: page([Notice(l.stateLoading)]),
      frame: (n) => page([n]),
      builder: (context, p) => page([
        const SizedBox(height: 24),
        FadeIn(
          child: _Header(source: s, profile: p),
        ),
        const SizedBox(height: 32),
        FadeIn(
          delay: 60,
          child: _Stats(source: s.id, profile: p),
        ),
        const SizedBox(height: 40),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (p.topTracks.isNotEmpty) ...[
              SizedBox(
                width: 616,
                child: _TopSongs(source: s.id, profile: p),
              ),
              const SizedBox(width: 52),
            ],
            if (p.playlists.isNotEmpty)
              Expanded(
                child: _Playlists(source: s.id, profile: p),
              ),
          ],
        ),
      ]),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.source, required this.profile});
  final Source source;
  final m.Profile profile;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final p = profile;
    return Row(
      children: [
        Container(
          width: 120,
          height: 120,
          alignment: Alignment.center,
          clipBehavior: Clip.antiAlias,
          decoration: const BoxDecoration(
            color: Color(0xFF6A3FB5),
            shape: BoxShape.circle,
          ),
          child: p.imageUrl.isNotEmpty
              ? Cover(p.imageUrl, w: 120, h: 120, r: 60)
              : tx(
                  p.name.isEmpty ? '?' : p.name.characters.first,
                  56,
                  w: w900,
                  c: white,
                ),
        ),
        const SizedBox(width: 28),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              tx(p.name, 44, w: w800, f: F.wide),
              const SizedBox(height: 6),
              Row(
                children: [
                  for (final (i, b) in p.badges.indexed) ...[
                    UiBadge(b, accented: i == 0),
                    const SizedBox(width: 8),
                  ],
                  if (p.badges.isNotEmpty) const SizedBox(width: 6),
                  // 几项之间留空隙分开，数字用主色突出
                  for (final (i, f) in p.facts.indexed) ...[
                    if (i > 0) const SizedBox(width: 16),
                    tx('${f.label} ', 13, w: w600, c: P.muted),
                    tx(f.value, 13, w: w700, c: P.ink, tnum: true),
                  ],
                ],
              ),
              if (p.signature.isNotEmpty) ...[
                const SizedBox(height: 10),
                tx(p.signature, 13, w: w500, c: P.faint),
              ],
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 44),
          child: RoundBtn(
            icon: 'more',
            tip: context.l10n.actionMore,
            size: 40,
            onTap: (ctx) => menuBelow(
              ctx,
              MenuSpec(
                groups: [
                  [
                    MenuItem(
                      'settings',
                      context.l10n.navSettings,
                      onTap: () => app.go('/settings'),
                    ),
                    if (source.can(Op.signOut))
                      MenuItem(
                        'arrow-left',
                        context.l10n.actionSignOut,
                        danger: true,
                        onTap: () async {
                          if (await confirmSignOut(context, source)) app.back();
                        },
                      ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

String _num(int n) {
  final s = '$n';
  final b = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
    b.write(s[i]);
  }
  return b.toString();
}

/// 统计卡片（最多三张）和「最常听的艺人」。
class _Stats extends StatelessWidget {
  const _Stats({required this.source, required this.profile});
  final String source;
  final m.Profile profile;

  static const _cards = [
    (wine, false),
    (Color(0xFFF6B73C), true),
    (Color(0xFF6A3FB5), false),
  ];

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final stats = profile.stats.take(3).toList();
    final top = profile.topArtists.firstOrNull;
    final topRoute = top == null
        ? null
        : app.artistRouteFor(source, top.artist.id);
    Widget stat(int i) {
      final x = stats[i];
      final (bg, dark) = _cards[i];
      return _StatCard(
        width: 240,
        bg: bg,
        dark: dark,
        onTap: x.link.isEmpty ? null : () => app.go('/library/${x.link}'),
        builder: (fg) => _big(x.label, _num(x.value), x.unit, fg),
      );
    }

    return Row(
      children: [
        for (var i = 0; i < stats.length && i < 2; i++) ...[
          stat(i),
          const SizedBox(width: 16),
        ],
        if (top != null)
          Expanded(
            child: _StatCard(
              width: double.infinity,
              bg: const Color(0xFFB8CEDD),
              dark: true,
              onTap: topRoute == null ? null : () => app.go(topRoute),
              builder: (fg) => Stack(
                children: [
                  tx(
                    context.l10n.profileTopArtists,
                    13,
                    w: w700,
                    f: F.semi,
                    c: fg.withValues(alpha: 0.7),
                  ),
                  Positioned(
                    left: 0,
                    top: 50,
                    right: 130,
                    child: tx(top.artist.name, 26, w: w900, f: F.wide, c: fg),
                  ),
                  if (top.plays > 0)
                    Positioned(
                      left: 0,
                      top: 92,
                      child: tx(
                        context.l10n.countPlays(_num(top.plays)),
                        13,
                        w: w600,
                        c: fg.withValues(alpha: 0.7),
                      ),
                    ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Cover(top.artist.imageUrl, w: 110, h: 110, r: 55),
                  ),
                ],
              ),
            ),
          )
        else
          const Spacer(),
        if (stats.length > 2) ...[const SizedBox(width: 16), stat(2)],
      ],
    );
  }
}

Widget _big(String label, String num, String unit, Color fg) => Stack(
  children: [
    tx(label, 13, w: w700, f: F.semi, c: fg.withValues(alpha: 0.7)),
    Positioned(
      left: -2,
      bottom: 2,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          tx(num, 48, w: w900, f: F.wide, c: fg),
          const SizedBox(width: 8),
          tx(unit, 13, w: w700, c: fg.withValues(alpha: 0.7)),
        ],
      ),
    ),
  ],
);

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.width,
    required this.bg,
    required this.dark,
    required this.builder,
    this.onTap,
  });
  final double width;
  final Color bg;
  final bool dark;
  final Widget Function(Color fg) builder;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Tap(
      onTap: onTap,
      builder: (_, h, _) => AnimatedSlide(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        offset: Offset(0, h && onTap != null ? -4 / 150 : 0),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: width,
          height: 150,
          padding: const EdgeInsets.all(20),
          decoration: squircle(
            24,
            color: bg,
            shadows: [
              BoxShadow(
                color: ba(h && onTap != null ? 0.6 : 0),
                blurRadius: 32,
                offset: const Offset(0, 16),
                spreadRadius: -12,
              ),
            ],
          ),
          child: builder(dark ? darkInk : white),
        ),
      ),
    );
  }
}

class _TopSongs extends StatelessWidget {
  const _TopSongs({required this.source, required this.profile});
  final String source;
  final m.Profile profile;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final rows = profile.topTracks;
    final tracks = [
      for (final r in rows)
        Track.of(r.track.source.isEmpty ? r.track.withSource(source) : r.track),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(
          profile.topTitle.isEmpty
              ? context.l10n.profileMostPlayed
              : profile.topTitle,
        ),
        const SizedBox(height: 14),
        Transform.translate(
          offset: const Offset(-10, 0),
          child: Column(
            children: [
              for (final (i, t) in tracks.indexed)
                Builder(
                  builder: (context) {
                    final current = app.track.key == t.key;
                    final off = t.ref?.unavailable ?? false;
                    void play() => current
                        ? app.togglePlay()
                        : app.playList(
                            [
                              for (final x in tracks)
                                if (!(x.ref?.unavailable ?? false)) x,
                            ],
                            start: tracks
                                .where((x) => !(x.ref?.unavailable ?? false))
                                .toList()
                                .indexOf(t),
                            name: profile.topTitle,
                          );
                    return Tap(
                      onDoubleTap: off ? null : play,
                      onMenu: (p) =>
                          showMenu(context, p, trackMenu(context, t)),
                      builder: (_, h, _) => AnimatedContainer(
                        duration: fast,
                        width: 636,
                        height: 46,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: squircle(
                          12,
                          color: h || current
                              ? P.surface
                              : P.surface.withValues(alpha: 0),
                        ),
                        child: Row(
                          children: [
                            RowIndex(
                              n: i + 1,
                              hover: h && !off,
                              current: current,
                              playing: app.playing,
                              width: 18,
                              align: Alignment.center,
                              onTap: off ? null : play,
                            ),
                            const SizedBox(width: 14),
                            Cover(t.cover, w: 38, h: 38, r: 6),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  tx(
                                    t.title,
                                    14,
                                    w: w700,
                                    c: current
                                        ? accent
                                        : (off ? P.faint : P.ink),
                                  ),
                                  const SizedBox(height: 2),
                                  tx(t.artist, 12, w: w500, c: P.muted),
                                ],
                              ),
                            ),
                            if (rows[i].plays > 0)
                              tx(
                                context.l10n.countPlays(_num(rows[i].plays)),
                                13,
                                w: w600,
                                c: P.faint,
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Playlists extends StatelessWidget {
  const _Playlists({required this.source, required this.profile});
  final String source;
  final m.Profile profile;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(
          context.l10n.profileMyPlaylists,
          onAll: () => app.go('/library/playlists'),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            for (final p in profile.playlists.take(8))
              SizedBox(
                width: 140,
                child: Tap(
                  onTap: () =>
                      app.go(AppState.remoteRoute('playlist', source, p.id)),
                  onMenu: (pos) => showMenu(
                    context,
                    pos,
                    playlistMenu(
                      context,
                      title: p.name,
                      meta: p.trackCount > 0
                          ? context.l10n.countTracks(p.trackCount)
                          : '',
                      cover: p.imageUrl,
                      onPlay: () => app.playPlaylist(source, p.id),
                    ),
                  ),
                  builder: (_, h, _) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: ClipRSuperellipse(
                          borderRadius: BorderRadius.circular(12),
                          child: AnimatedScale(
                            scale: h ? 1.06 : 1,
                            duration: const Duration(milliseconds: 400),
                            curve: smooth,
                            child: Cover(p.imageUrl, w: 140, h: 140, r: 0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      tx(p.name, 13, w: w700, f: F.semi),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
