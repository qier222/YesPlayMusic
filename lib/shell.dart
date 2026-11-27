import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'data.dart';
import 'l10n/l10n.dart';
import 'menus.dart';
import 'pages/album.dart';
import 'pages/coverflow.dart';
import 'pages/library.dart';
import 'pages/now_playing.dart';
import 'pages/plugin_ui.dart';
import 'pages/profile.dart';
import 'pages/remote.dart';
import 'pages/settings.dart';
import 'pages/sign_in_dialog.dart';
import 'pages/source_switcher.dart';
import 'state.dart';
import 'system.dart';
import 'theme.dart';
import 'ui.dart';
import 'updater.dart';

const _window = MethodChannel('yesplaymusic/window');

/// Tells the native side whether closing the window should keep the app running,
/// plus the localized tray menu labels (Windows). Only sends when something changed.
String? _sentWindowPrefs;
void _syncWindowPrefs(bool keepRunning, AppLocalizations l) {
  final args = {
    'keepRunning': keepRunning,
    'show': l.trayShowWindow,
    'quit': l.trayQuit,
    if (Platform.isWindows) ...{
      'play': l.actionPlay,
      'pause': l.actionPause,
      'prev': l.actionPrev,
      'next': l.actionNext,
      'like': l.actionLike,
      'unlike': l.actionUnlike,
      'shuffle': l.actionShuffle,
      'repeat': l.miniRepeatOn,
      'repeatOne': l.miniRepeatOne,
    },
  };
  final key = '$args';
  if (key == _sentWindowPrefs) return;
  _sentWindowPrefs = key;
  _window.invokeMethod('prefs', args).catchError((_) => null);
}

/// Drag the window by holding empty space (macOS hides the title bar).
class DragWindow extends StatelessWidget {
  const DragWindow({super.key, this.child});
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onPanStart: (_) =>
          _window.invokeMethod('startDrag').catchError((_) => null),
      onDoubleTap: () => _window.invokeMethod('zoom').catchError((_) => null),
      child: child ?? const SizedBox.expand(),
    );
  }
}

/// Window state the native side reports (Windows only).
final _maximized = ValueNotifier(false);
final _active = ValueNotifier(true);

void _applyWindowState(Object? state) {
  if (state is! Map) return;
  _maximized.value = state['maximized'] == true;
  _active.value = state['active'] != false;
}

/// Minimize, maximize and close for Windows, where the app draws its own title bar.
/// Sized and styled like the Windows 11 caption buttons (46 × 32, Segoe glyphs).
class WindowButtons extends StatefulWidget {
  const WindowButtons({super.key});

  static bool get shown => Platform.isWindows;

  @override
  State<WindowButtons> createState() => _WindowButtonsState();
}

class _WindowButtonsState extends State<WindowButtons> {
  @override
  void initState() {
    super.initState();
    _window.setMethodCallHandler((call) async {
      if (call.method == 'state') _applyWindowState(call.arguments);
    });
    _window
        .invokeMethod('state')
        .then(_applyWindowState)
        .catchError((_) => null);
  }

  @override
  void dispose() {
    _window.setMethodCallHandler(null);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return ListenableBuilder(
      listenable: Listenable.merge([_maximized, _active]),
      builder: (context, _) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _CaptionButton(
            glyph: '\uE921',
            label: l.windowMinimize,
            onTap: () => _window.invokeMethod('minimize'),
          ),
          _CaptionButton(
            glyph: _maximized.value ? '\uE923' : '\uE922',
            label: _maximized.value ? l.windowRestore : l.windowMaximize,
            onTap: () => _window.invokeMethod('zoom'),
          ),
          _CaptionButton(
            glyph: '\uE8BB',
            label: l.actionClose,
            close: true,
            onTap: () => _window.invokeMethod('close'),
          ),
        ],
      ),
    );
  }
}

class _CaptionButton extends StatelessWidget {
  const _CaptionButton({
    required this.glyph,
    required this.label,
    required this.onTap,
    this.close = false,
  });

  final String glyph, label;
  final VoidCallback onTap;
  final bool close;

  /// Windows 11 close button red.
  static const _red = Color(0xFFC42B1C);

  @override
  Widget build(BuildContext context) {
    return Tap(
      semanticLabel: label,
      cursor: SystemMouseCursors.basic,
      onTap: onTap,
      builder: (_, hover, pressed) {
        final Color bg;
        if (close) {
          bg = pressed
              ? _red.withValues(alpha: 0.9)
              : hover
              ? _red
              : const Color(0x00000000);
        } else {
          bg = P.ink.withValues(
            alpha: pressed
                ? 0.04
                : hover
                ? 0.08
                : 0,
          );
        }
        final fg = close && (hover || pressed)
            ? const Color(0xFFFFFFFF)
            : P.ink.withValues(alpha: _active.value ? 1 : 0.4);
        return Container(
          width: 46,
          height: 32,
          color: bg,
          alignment: Alignment.center,
          child: Text(
            glyph,
            style: TextStyle(
              fontFamily: 'Segoe Fluent Icons',
              fontFamilyFallback: const ['Segoe MDL2 Assets'],
              fontSize: 10,
              color: fg,
            ),
          ),
        );
      },
    );
  }
}

class Shell extends StatelessWidget {
  const Shell({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    _syncWindowPrefs(app.keepRunning, context.l10n);
    final full = app.path.startsWith('/coverflow');
    return Container(
      color: P.ground,
      child: Stack(
        children: [
          if (full) ...[
            const Positioned.fill(child: PageHost()),
            const Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: TipScope(child: MiniPlayer(onDark: true, collapse: true)),
            ),
          ] else ...[
            // Don't clip the left side of the page: cover shadows etc. can extend under the sidebar instead of being cut at x72.
            // The sidebar is painted above the page, so icons are unaffected.
            const Positioned(
              left: 72,
              top: 0,
              right: 0,
              bottom: 0,
              child: ClipRect(clipper: _BleedLeft(), child: PageHost()),
            ),
            const Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: 72,
              child: Rail(),
            ),
            // The empty area of the top title bar supports dragging and double-click to zoom (avoiding the back button on the left and buttons on the right)
            const Positioned(
              left: 168,
              right: 96,
              top: 0,
              height: 72,
              child: DragWindow(),
            ),
            const Positioned(
              left: 72,
              right: 0,
              bottom: 0,
              child: TipScope(child: MiniPlayer()),
            ),
          ],
          const Positioned.fill(child: NowPlayingHost()),
          const Positioned.fill(child: SignInPromptLayer()),
          // Toasts sit at the bottom, 12 above the player bar, centered in the page area like the player bar:
          // floating player bar bottom 16 + height 64; on Now Playing the bar's bottom is 32 + height 72.
          Positioned(
            left: full || app.npOpen ? 0 : 72,
            right: 0,
            bottom: app.npOpen ? 116 : (app.hasQueue ? 92 : 32),
            child: const ToastView(),
          ),
          // Windows has no system title bar; the caption buttons sit above every page
          if (WindowButtons.shown)
            const Positioned(top: 0, right: 0, child: WindowButtons()),
        ],
      ),
    );
  }
}

/// The avatar at the bottom left of the sidebar, showing the current music source:
/// - plugin signed in with an avatar: the account avatar, with the plugin icon overlaid at the bottom right;
/// - plugin without an avatar: the plugin icon clipped to a circle;
/// - local music: the Music icon.
/// Click (or right-click) opens the "Music source" menu, which also leads to the profile page.
class _Avatar extends StatelessWidget {
  const _Avatar();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final id = app.sourceId;
    final plugin = app.plugins.where((x) => x.id == id).firstOrNull;
    final l = context.l10n;
    final img = plugin == null ? '' : app.accounts[id]?.imageUrl ?? '';
    final name = plugin == null ? l.sourceLocal : plugin.tr(plugin.info.name);
    return Tap(
      tip: l.sourceMusicSource,
      onTap: () => showSourceSwitcher(context),
      onMenu: (_) => showSourceSwitcher(context),
      builder: (_, h, p) => PressScale(
        pressed: p,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned.fill(
                child: img.isNotEmpty
                    ? Cover(img, w: 40, h: 40, r: 20)
                    : SourceIcon(id: id, name: name, size: 40, round: true),
              ),
              // Slightly brighter on hover
              Positioned.fill(
                child: AnimatedContainer(
                  duration: fast,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: wa(h ? 0.12 : 0),
                  ),
                ),
              ),
              if (img.isNotEmpty)
                Positioned(
                  right: -4,
                  bottom: -4,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: squircle(7, color: P.ground),
                    child: SourceIcon(id: id, name: name, size: 16),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Clips only the top, right and bottom; the left extends an extra 72 under the sidebar.
class _BleedLeft extends CustomClipper<Rect> {
  const _BleedLeft();
  @override
  Rect getClip(Size size) => Rect.fromLTRB(-72, 0, size.width, size.height);
  @override
  bool shouldReclip(_BleedLeft old) => false;
}

// ───────────── Page transitions ─────────────

class PageHost extends StatelessWidget {
  const PageHost({super.key});

  Widget _page(BuildContext context, AppState app, String path) {
    final seg = path.split('/');
    // Plugin albums, artists, playlists: /album/@<source>/<id>
    final kind = seg.length > 1 ? seg[1] : '';
    if (seg.length > 3 && seg[2].startsWith('@')) {
      final src = seg[2].substring(1), id = Uri.decodeComponent(seg[3]);
      switch (kind) {
        case 'album':
          return RemoteAlbumPage(source: src, id: id);
        case 'artist':
          return RemoteArtistPage(source: src, id: id);
        case 'playlist':
          return RemotePlaylistPage(source: src, id: id);
      }
    }
    switch (kind) {
      // The current source has no home or Discover (local mode, or the plugin doesn't provide them; when going back to these pages)
      case 'home' when !app.hasHome:
        return const LibraryPage(tab: 'albums');
      case 'discover' when !app.hasDiscover:
        return const LibraryPage(tab: 'albums');
      case 'home' || 'discover':
        // Home and Discover both come from the current music source; while the plugin is still loading,
        // show a skeleton for the source chosen in settings. While local music has found no songs yet, show the library's empty state.
        final src = app.remote || app.pluginsLoaded
            ? app.sourceId
            : app.chosenSource;
        if (src == 'local' && app.local == null) {
          return const LibraryPage(tab: 'albums');
        }
        return kind == 'home'
            ? RemoteHomePage(source: src, greeting: true)
            : RemoteHomePage(
                source: src,
                title: context.l10n.navDiscover,
                discover: true,
              );
      case 'library':
        return LibraryPage(tab: seg.length > 2 ? seg[2] : 'albums');
      case 'coverflow':
        return CoverflowPage(tab: seg.length > 2 ? seg[2] : 'albums');
      case 'album' when seg.length > 2:
        return AlbumPage(id: Uri.decodeComponent(seg[2]));
      case 'settings':
        return const SettingsPage();
      case 'profile':
        return const ProfilePage();
      case 'search':
        return RemoteSearchPage(source: app.sourceId);
    }
    return const LibraryPage(tab: 'albums');
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final path = app.path;
    // No full-page transition between the four library subpages; the page handles it internally.
    // When the music source changes, pages whose content comes from it are replaced entirely; Settings etc. aren't,
    // or switching the music source in Settings would flash the whole page.
    final base = path.startsWith('/library') ? '/library' : path;
    final bySource = RegExp(
      r'^/(library|coverflow|home|discover|search|profile)(/|$)',
    ).hasMatch(path);
    final key = bySource ? '$base#${app.sourceId}' : base;
    final back = app.navBack;
    return ScrollConfiguration(
      behavior: const NoBars(),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 320),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (child, anim) {
          final incoming = child.key == ValueKey(key);
          final dir = (back ? -1.0 : 1.0) * (incoming ? 1 : -1);
          return FadeTransition(
            opacity: anim,
            child: AnimatedBuilder(
              animation: anim,
              builder: (_, c) => Transform.translate(
                offset: Offset(24 * dir * (1 - anim.value), 0),
                child: c,
              ),
              child: child,
            ),
          );
        },
        // Not clipped: pages can show through to the left under the sidebar; Shell's _BleedLeft clips them all
        layoutBuilder: (current, previous) => Stack(
          fit: StackFit.expand,
          clipBehavior: Clip.none,
          children: [...previous, ?current],
        ),
        child: KeyedSubtree(
          key: ValueKey(key),
          child: _page(context, app, path),
        ),
      ),
    );
  }
}

// ───────────── Left icon bar ─────────────

class Rail extends StatelessWidget {
  const Rail({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final path = app.path;
    bool on(String p) => path.startsWith(p);
    // No fill: the background comes from Shell's P.ground, letting the album page's cover-color background show through.
    return SizedBox(
      width: 72,
      child: Stack(
        children: [
          const Positioned.fill(child: DragWindow()),
          Positioned.fill(
            child: Column(
              children: [
                const SizedBox(height: 92),
                // Clicking the logo opens the GitHub repository
                Tap(
                  tip: 'GitHub',
                  onTap: () => openExternal(Updater.repoPage),
                  builder: (_, _, p) => AnimatedScale(
                    scale: p ? 0.92 : 1,
                    duration: fast,
                    child: Container(
                      width: 40,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: squircle(14, color: P.ink),
                      child: Image.asset(
                        'assets/icons/png/24/logo.png',
                        width: 22,
                        height: 22,
                        color: P.ground,
                        colorBlendMode: BlendMode.srcIn,
                        filterQuality: FilterQuality.medium,
                        gaplessPlayback: true,
                        excludeFromSemantics: true,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 36),
                // Hidden when the current source provides no home or Discover (local mode has neither)
                if (app.hasHome) ...[
                  _NavBtn(
                    'home',
                    context.l10n.navHome,
                    on('/home'),
                    () => app.goTab(0),
                  ),
                  const SizedBox(height: 8),
                ],
                if (app.hasDiscover) ...[
                  _NavBtn(
                    'compass',
                    context.l10n.navDiscover,
                    on('/discover'),
                    () => app.goTab(1),
                  ),
                  const SizedBox(height: 8),
                ],
                _NavBtn(
                  'library',
                  context.l10n.navLibrary,
                  on('/library') || on('/album') || on('/playlist'),
                  () => app.goTab(2),
                ),
                const SizedBox(height: 8),
                _NavBtn(
                  'search',
                  context.l10n.navSearch,
                  on('/search'),
                  () => app.goTab(3),
                ),
                const Spacer(),
                _NavBtn(
                  'gear',
                  context.l10n.navSettings,
                  on('/settings'),
                  () => app.go('/settings'),
                ),
                const SizedBox(height: 12),
                const _Avatar(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavBtn extends StatelessWidget {
  const _NavBtn(this.icon, this.label, this.active, this.onTap);
  final String icon, label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tap(
      tip: label,
      onTap: onTap,
      builder: (_, h, p) => PressScale(
        pressed: p,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          width: 48,
          height: 48,
          alignment: Alignment.center,
          decoration: squircle(
            16,
            color: active
                ? glass(P.raised)
                : (h
                      ? glass(P.surface)
                      : glass(P.surface).withValues(alpha: 0)),
          ),
          child: Ico(icon, size: 24, color: active || h ? P.ink : P.muted),
        ),
      ),
    );
  }
}

// ───────────── Mini player bar ─────────────

BoxShadow _segShadow(bool dark) => BoxShadow(
  color: ba(dark ? 0.63 : 0.12),
  blurRadius: 32,
  offset: const Offset(0, 12),
  spreadRadius: -8,
);

class _Seg extends StatelessWidget {
  const _Seg({
    required this.width,
    required this.child,
    this.hover = false,
    this.onDark = false,
  });
  final double width;
  final bool hover, onDark;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final pal = onDark ? Palette.darkPalette : P;
    return AnimatedContainer(
      duration: fast,
      width: width,
      height: 64,
      decoration: squircle(
        22,
        color: hover ? pal.hover : pal.floating,
        shadows: [_segShadow(pal.dark)],
        side: pal.dark ? null : BorderSide(color: ba(0.06)),
      ),
      child: child,
    );
  }
}

class MiniPlayer extends StatefulWidget {
  const MiniPlayer({super.key, this.onDark = false, this.collapse = false});

  /// Clear space below page controls, including the fade above the bar.
  static const bottomInset = 110.0;

  final bool onDark;

  /// In Coverflow, "Collapse" is added at the far left (final v33); with an empty queue only this part remains
  final bool collapse;

  @override
  State<MiniPlayer> createState() => _MiniPlayerState();
}

class _MiniPlayerState extends State<MiniPlayer> {
  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final onDark = widget.onDark;
    final pal = onDark ? Palette.darkPalette : P;
    final fade = onDark ? black : P.ground;
    final collapseSeg = _IconSeg(
      icon: 'chevron-down',
      tip: context.l10n.actionCollapse,
      color: pal.ink,
      onDark: onDark,
      onTap: app.back,
    );
    // Hidden when the queue is empty (final · empty state); Coverflow keeps the collapse button
    if (!app.hasQueue && !widget.collapse) return const SizedBox();
    return SizedBox(
      height: 260,
      child: Stack(
        children: [
          // Bottom gradient so content fades as it slides under the player bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: MiniPlayer.bottomInset,
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      fade.withValues(alpha: 0),
                      fade.withValues(alpha: 0.9),
                      fade,
                    ],
                    stops: const [0, 0.45, 1],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 16,
            height: 240,
            // Align to the bottom: the expanded volume bar (160) is shorter than this area, so centering would lift the whole player bar.
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (!app.hasQueue)
                    collapseSeg
                  else ...[
                    if (widget.collapse) ...[
                      collapseSeg,
                      const SizedBox(width: 6),
                    ],
                    _NowSeg(onDark: onDark),
                    const SizedBox(width: 6),
                    _LyricSeg(onDark: onDark),
                    const SizedBox(width: 6),
                    _IconSeg(
                      icon: 'shuffle',
                      tip: app.shuffle
                          ? context.l10n.miniShuffleOn
                          : context.l10n.actionShuffle,
                      color: app.shuffle ? accent : pal.muted,
                      dot: app.shuffle,
                      onDark: onDark,
                      onTap: app.toggleShuffle,
                    ),
                    const SizedBox(width: 6),
                    _ControlsSeg(onDark: onDark),
                    const SizedBox(width: 6),
                    _IconSeg(
                      icon: app.repeatMode == PlaybackRepeatMode.one
                          ? 'repeat-one'
                          : 'repeat',
                      tip: switch (app.repeatMode) {
                        PlaybackRepeatMode.off => context.l10n.miniRepeatOff,
                        PlaybackRepeatMode.all => context.l10n.miniRepeatOn,
                        PlaybackRepeatMode.one => context.l10n.miniRepeatOne,
                      },
                      color: app.repeatMode == PlaybackRepeatMode.off
                          ? pal.muted
                          : accent,
                      dot: app.repeatMode != PlaybackRepeatMode.off,
                      onDark: onDark,
                      onTap: app.toggleRepeat,
                    ),
                    const SizedBox(width: 6),
                    VolumeSeg(
                      width: 52,
                      base: 64,
                      radius: 22,
                      bg: pal.floating,
                      fill: pal.dark ? wa(0.18) : ba(0.1),
                      shadow: true,
                      forceDark: onDark,
                    ),
                    const SizedBox(width: 6),
                    _IconSeg(
                      icon: 'queue',
                      tip: context.l10n.miniQueue,
                      color: pal.ink,
                      onDark: onDark,
                      onTap: () => app.openNowPlaying(NpTab.queue),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _IconSeg extends StatelessWidget {
  const _IconSeg({
    required this.icon,
    required this.tip,
    required this.color,
    required this.onTap,
    this.dot = false,
    this.onDark = false,
  });
  final String icon, tip;
  final Color color;
  final bool dot, onDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tap(
      tip: tip,
      onTap: onTap,
      builder: (_, h, p) => _Seg(
        width: 52,
        hover: h,
        onDark: onDark,
        child: Stack(
          alignment: Alignment.center,
          children: [
            PressScale(
              pressed: p,
              down: 0.86,
              child: Ico(icon, size: 24, color: color),
            ),
            Positioned(
              top: 46,
              child: AnimatedScale(
                scale: dot ? 1 : 0,
                duration: const Duration(milliseconds: 260),
                curve: bouncy,
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NowSeg extends StatelessWidget {
  const _NowSeg({this.onDark = false});
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final t = app.track;
    final pal = onDark ? Palette.darkPalette : P;
    return Tap(
      tip: context.l10n.miniOpenNowPlaying,
      onTap: () => app.openNowPlaying(NpTab.lyrics),
      onMenu: (pos) => showMenu(context, pos, trackMenu(context, t)),
      builder: (_, h, p) => _Seg(
        width: 264,
        hover: h,
        onDark: onDark,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              SizedBox(
                width: 48,
                height: 48,
                child: _SmoothRRectMask(
                  radius: 14,
                  child: Stack(
                    children: [
                      AnimatedSwitcher(
                        transitionBuilder: fadeOnly,
                        duration: const Duration(milliseconds: 300),
                        child: Cover(
                          t.cover,
                          key: ValueKey(t.cover),
                          w: 48,
                          h: 48,
                          r: 0,
                        ),
                      ),
                      AnimatedOpacity(
                        duration: fast,
                        opacity: h ? 1 : 0,
                        child: Container(
                          color: ba(0.6),
                          alignment: Alignment.center,
                          child: AnimatedSlide(
                            duration: const Duration(milliseconds: 200),
                            offset: Offset(0, h ? 0 : 0.3),
                            child: const Ico(
                              'chevron-up',
                              size: 24,
                              color: white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title and artist use the same font: the wide face is too cramped in such a narrow space
                    tx(t.title, 15, w: w700, c: pal.ink),
                    const SizedBox(height: 4),
                    // The artist is display-only, not clickable: a click here opens Now Playing, so a link would be easy to hit by mistake
                    tx(t.artist, 13, w: w500, c: pal.muted),
                  ],
                ),
              ),
              HeartButton(
                liked: app.isLiked,
                onTap: () => app.toggleLike(),
                size: 20,
                offColor: pal.muted,
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
      ),
    );
  }
}

/// Rounded mask for the floating player cover: renders an offscreen mask with analytically anti-aliased drawRSuperellipse and composites with dstIn,
/// avoiding the jagged rounded corners of ClipRRect/ClipRSuperellipse, which clip with a 4x MSAA stencil under Impeller,
/// and clipping the cover and hover overlay together so two stacked rounded corners don't leak at the edges.
class _SmoothRRectMask extends StatefulWidget {
  const _SmoothRRectMask({required this.radius, required this.child});
  final double radius;
  final Widget child;

  @override
  State<_SmoothRRectMask> createState() => _SmoothRRectMaskState();
}

class _SmoothRRectMaskState extends State<_SmoothRRectMask> {
  ui.Image? _mask;
  ui.ImageShader? _shader;
  int _pw = 0;
  int _ph = 0;
  double _dpr = 0;
  double _radius = 0;

  ui.Shader _shaderFor(Rect bounds, double dpr) {
    final pw = (bounds.width * dpr).round().clamp(1, 4096);
    final ph = (bounds.height * dpr).round().clamp(1, 4096);
    if (_shader == null ||
        _pw != pw ||
        _ph != ph ||
        _dpr != dpr ||
        _radius != widget.radius) {
      _mask?.dispose();
      final rec = ui.PictureRecorder();
      final canvas = Canvas(rec);
      canvas.scale(pw / bounds.width, ph / bounds.height);
      canvas.drawRSuperellipse(
        ui.RSuperellipse.fromRectAndRadius(
          Rect.fromLTWH(0, 0, bounds.width, bounds.height),
          Radius.circular(widget.radius),
        ),
        Paint()
          ..color = const Color(0xFFFFFFFF)
          ..isAntiAlias = true,
      );
      final pic = rec.endRecording();
      _mask = pic.toImageSync(pw, ph);
      pic.dispose();
      _shader = ui.ImageShader(
        _mask!,
        TileMode.clamp,
        TileMode.clamp,
        Matrix4.diagonal3Values(
          bounds.width / pw,
          bounds.height / ph,
          1,
        ).storage,
      );
      _pw = pw;
      _ph = ph;
      _dpr = dpr;
      _radius = widget.radius;
    }
    return _shader!;
  }

  @override
  void dispose() {
    _mask?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dpr = MediaQuery.maybeDevicePixelRatioOf(context) ?? 2;
    return ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (bounds) => _shaderFor(bounds, dpr),
      child: widget.child,
    );
  }
}

/// Like button: pops when lit.
class HeartButton extends StatelessWidget {
  const HeartButton({
    super.key,
    required this.liked,
    required this.onTap,
    this.size = 20,
    this.offColor,
    this.box = 32,
  });
  final bool liked;
  final VoidCallback onTap;
  final double size, box;
  final Color? offColor;

  @override
  Widget build(BuildContext context) {
    return Tap(
      tip: liked ? context.l10n.actionUnlike : context.l10n.actionLike,
      onTap: onTap,
      builder: (_, h, p) => SizedBox(
        width: box,
        height: box,
        child: Center(
          child: TweenAnimationBuilder<double>(
            key: ValueKey(liked),
            tween: Tween(begin: liked ? 1.45 : 0.8, end: 1),
            duration: const Duration(milliseconds: 420),
            curve: bouncy,
            builder: (_, s, c) =>
                Transform.scale(scale: s * (p ? 0.85 : 1), child: c),
            child: Ico(
              liked ? 'heart-filled' : 'heart',
              size: size,
              color: liked ? heart : (h ? P.ink : (offColor ?? P.muted)),
            ),
          ),
        ),
      ),
    );
  }
}

/// The progress bar section: played part is translucent white; a purple line at the edge for hover preview and dragging.
class _LyricSeg extends StatefulWidget {
  const _LyricSeg({this.onDark = false});
  final bool onDark;

  @override
  State<_LyricSeg> createState() => _LyricSegState();
}

class _LyricSegState extends State<_LyricSeg> {
  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final pal = widget.onDark ? Palette.darkPalette : P;
    const w = 300.0;
    return Container(
      width: w,
      height: 64,
      decoration: squircle(22, shadows: [_segShadow(pal.dark)]),
      child: ValueListenableBuilder<double>(
        valueListenable: app.pos,
        builder: (context, _, _) {
          final prog = app.progress;
          final duration = app.playbackDuration;
          return Scrubber(
            onChanged: app.scrub,
            onCommit: app.seek,
            builder: (_, at, dragging) {
              final lyricIdx = app.lyricIndex;
              final activeLyric = lyricIdx >= 0
                  ? app.lyricLines[lyricIdx].text
                  : null;
              // With the mini lyric setting on, the lyric is always shown; off, only while the mouse is over the
              // progress bar (or dragging). Hovering other player bar buttons doesn't count.
              final showLyric =
                  activeLyric != null &&
                  (app.miniLyric || at != null || dragging);
              // While dragging, the time on the left follows the hand.
              final elapsed = dragging && at != null
                  ? at * duration
                  : app.position;
              return TipAnchor(
                text: fmtTime((at ?? 0) * duration),
                show: at != null && !dragging,
                dx: (at ?? 0) * w,
                child: ClipRSuperellipse(
                  borderRadius: BorderRadius.circular(22),
                  child: Container(
                    color: pal.floating,
                    child: Stack(
                      children: [
                        Positioned(
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: w * prog,
                          child: Container(
                            color: pal.dark ? wa(0.18) : ba(0.08),
                          ),
                        ),
                        if (at != null && !dragging && at > prog)
                          Positioned(
                            left: w * prog,
                            top: 0,
                            bottom: 0,
                            width: w * (at - prog),
                            child: Container(
                              color: pal.dark ? wa(0.08) : ba(0.04),
                            ),
                          ),
                        if (dragging)
                          Positioned(
                            left: w * prog - 1,
                            top: 12,
                            bottom: 12,
                            width: 2,
                            child: Container(
                              decoration: squircle(1, color: accent),
                            ),
                          )
                        else if (at != null)
                          Positioned(
                            left: w * at - 1,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            child: Container(color: pal.ink),
                          ),
                        // Final: normally "played … total" is vertically centered; when hovering with lyrics, this line
                        // slides down and the current lyric fades in above. Lyric changes replace directly without animation.
                        // With keys: on hover a preview bar and cursor line are inserted before; without keys
                        // these two layers would rebuild as new widgets and the implicit animations would be lost.
                        Positioned(
                          key: const ValueKey('lyric'),
                          left: 18,
                          right: 18,
                          top: 13,
                          child: IgnorePointer(
                            child: AnimatedOpacity(
                              opacity: showLyric ? 1 : 0,
                              duration: _lyricAnim,
                              curve: Curves.easeOutCubic,
                              child: AnimatedSlide(
                                offset: showLyric
                                    ? Offset.zero
                                    : const Offset(0, 0.4),
                                duration: _lyricAnim,
                                curve: Curves.easeOutCubic,
                                child: tx(
                                  activeLyric ?? '',
                                  14,
                                  w: w600,
                                  c: pal.ink,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          key: const ValueKey('time'),
                          left: 18,
                          right: 18,
                          top: 0,
                          bottom: 0,
                          child: IgnorePointer(
                            child: AnimatedAlign(
                              // In the 64-high bar: 0 is centered (top 25), 0.44 is about top 36.
                              alignment: Alignment(-1, showLyric ? 0.44 : 0),
                              duration: _lyricAnim,
                              curve: Curves.easeOutCubic,
                              child: Row(
                                children: [
                                  // Make room for lyrics on hover: played time goes from white to gray.
                                  TweenAnimationBuilder<Color?>(
                                    tween: ColorTween(
                                      end: showLyric ? pal.muted : pal.ink,
                                    ),
                                    duration: _lyricAnim,
                                    curve: Curves.easeOutCubic,
                                    builder: (_, c, _) => tx(
                                      fmtTime(elapsed),
                                      12,
                                      w: w600,
                                      c: c,
                                      tnum: true,
                                    ),
                                  ),
                                  const Spacer(),
                                  tx(
                                    fmtTime(duration),
                                    12,
                                    w: w600,
                                    c: pal.muted,
                                    tnum: true,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

const _lyricAnim = Duration(milliseconds: 260);

class _ControlsSeg extends StatelessWidget {
  const _ControlsSeg({this.onDark = false});
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final pal = onDark ? Palette.darkPalette : P;
    Widget btn(String icon, String tip, double size, VoidCallback onTap) => Tap(
      tip: tip,
      onTap: onTap,
      builder: (_, h, p) => AnimatedContainer(
        duration: fast,
        width: 52,
        height: 64,
        alignment: Alignment.center,
        decoration: squircle(
          22,
          color: h ? pal.hover : const Color(0x00000000),
        ),
        child: PressScale(
          pressed: p,
          down: 0.86,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 180),
            transitionBuilder: (c, a) => ScaleTransition(
              scale: a,
              child: FadeTransition(opacity: a, child: c),
            ),
            child: Ico(icon, key: ValueKey(icon), size: size, color: pal.ink),
          ),
        ),
      ),
    );
    return _Seg(
      width: 156,
      onDark: onDark,
      child: Row(
        children: [
          btn('previous', context.l10n.actionPrev, 24, app.prev),
          btn(
            app.playing ? 'pause' : 'play',
            app.playing ? context.l10n.actionPause : context.l10n.actionPlay,
            28,
            app.togglePlay,
          ),
          btn('next', context.l10n.actionNext, 24, app.next),
        ],
      ),
    );
  }
}

// ───────────── Volume (expands vertically) ─────────────

/// When collapsed, the button shows the volume level; on hover it expands upward into a vertical bar, adjusted by drag or wheel; clicking the icon mutes.
class VolumeSeg extends StatefulWidget {
  const VolumeSeg({
    super.key,
    required this.width,
    required this.base,
    required this.radius,
    required this.bg,
    required this.fill,
    this.onCover = false,
    this.shadow = false,
    this.forceDark = false,
  });
  final double width, base, radius;
  final Color bg, fill;
  final bool onCover, shadow, forceDark;

  @override
  State<VolumeSeg> createState() => _VolumeSegState();
}

class _VolumeSegState extends State<VolumeSeg> {
  bool _hover = false;
  bool _drag = false;
  // Expanded height: 2/3 of the original 240, kept even
  static const _open = 160.0;

  void _setFrom(double dy, double h) {
    context.appRead.setVolume(1 - dy / h);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final open = _hover || _drag;
    final vol = app.effectiveVolume;
    final w = widget.width;
    final base = widget.base;
    return SizedBox(
      width: w,
      height: _open,
      child: Align(
        alignment: Alignment.bottomCenter,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: TweenAnimationBuilder<double>(
            tween: Tween(end: open ? _open : base),
            duration: const Duration(milliseconds: 380),
            curve: const SpringCurve(bounce: 0.12),
            builder: (context, h, _) {
              // The number starts appearing at 1/4 expanded and is fully shown at 3/4 (proportional, so changing the height needs no retuning)
              final span = _open - base;
              final reveal = ((h - base - span / 4) / (span / 2)).clamp(
                0.0,
                1.0,
              );
              final fillH = (h * vol).clamp(0.0, h);
              final numOnFill = fillH > h - 36;
              Widget icon(Color c) => app.muted || vol == 0
                  ? Ico('mute', size: 24, color: c)
                  : Ico('volume', size: 24, color: c);
              return Listener(
                onPointerSignal: (e) {
                  if (e is PointerScrollEvent) {
                    app.setVolume(app.volume - e.scrollDelta.dy / 600);
                  }
                },
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTapUp: (d) {
                    if (d.localPosition.dy > h - base) {
                      app.toggleMute();
                    } else {
                      _setFrom(d.localPosition.dy, h);
                    }
                  },
                  onVerticalDragStart: (d) => setState(() => _drag = true),
                  onVerticalDragUpdate: (d) => _setFrom(d.localPosition.dy, h),
                  onVerticalDragEnd: (_) => setState(() => _drag = false),
                  onVerticalDragCancel: () => setState(() => _drag = false),
                  child: Container(
                    width: w,
                    height: h,
                    decoration: squircle(
                      widget.radius,
                      color: widget.bg,
                      shadows: widget.shadow
                          ? [_segShadow(widget.forceDark || P.dark)]
                          : null,
                      side: !widget.onCover && !widget.forceDark && !P.dark
                          ? BorderSide(color: ba(0.06))
                          : null,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      children: [
                        // Fill = current volume
                        Positioned(
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: fillH,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 90),
                            color: widget.fill,
                          ),
                        ),
                        if (_drag)
                          Positioned(
                            left: 12,
                            right: 12,
                            bottom: fillH - 1,
                            height: 2,
                            child: Container(
                              decoration: squircle(1, color: accent),
                            ),
                          ),
                        if (reveal > 0)
                          Positioned(
                            top: 16,
                            left: 0,
                            right: 0,
                            child: Opacity(
                              opacity: reveal,
                              child: tx(
                                app.muted || vol == 0
                                    ? context.l10n.miniMute
                                    : '${(vol * 100).round()}',
                                13,
                                w: w800,
                                tnum: true,
                                align: TextAlign.center,
                                c: widget.onCover
                                    ? (numOnFill ? darkInk : wa(0.85))
                                    : (_drag
                                          ? (widget.forceDark
                                                ? Palette.darkPalette.muted
                                                : P.muted)
                                          : (widget.forceDark || P.dark
                                                ? const Color(0xFFC4C4CC)
                                                : P.muted)),
                              ),
                            ),
                          ),
                        Positioned(
                          left: (w - 24) / 2,
                          bottom: (base - 24) / 2,
                          child: icon(
                            widget.onCover
                                ? white
                                : (widget.forceDark
                                      ? Palette.darkPalette.ink
                                      : P.ink),
                          ),
                        ),
                        // On the cover: the icon inside the white fill turns dark (simulating a difference blend)
                        if (widget.onCover)
                          Positioned(
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: fillH,
                            child: ClipRect(
                              child: OverflowBox(
                                alignment: Alignment.bottomCenter,
                                maxHeight: base,
                                minHeight: base,
                                child: Center(child: icon(darkInk)),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

// ───────────── Now Playing: rises from the bottom ─────────────

class NowPlayingHost extends StatefulWidget {
  const NowPlayingHost({super.key});

  @override
  State<NowPlayingHost> createState() => _NowPlayingHostState();
}

class _NowPlayingHostState extends State<NowPlayingHost>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 560),
    reverseDuration: const Duration(milliseconds: 420),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final open = context.app.npOpen;
    if (open && _c.status != AnimationStatus.forward && _c.value < 1) {
      _c.forward();
    }
    if (!open && _c.status != AnimationStatus.reverse && _c.value > 0) {
      _c.reverse();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.app; // subscribe
    return AnimatedBuilder(
      animation: _c,
      builder: (context, child) {
        if (_c.value == 0) return const SizedBox.shrink();
        final t = _c.status == AnimationStatus.reverse
            ? Curves.easeInCubic.transform(_c.value)
            : const SpringCurve(bounce: 0.04).transform(_c.value);
        return FractionalTranslation(
          translation: Offset(0, 1 - t),
          child: child,
        );
      },
      child: Shortcuts(
        shortcuts: const {
          SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
        },
        child: Actions(
          actions: {
            DismissIntent: CallbackAction<DismissIntent>(
              onInvoke: (_) => context.appRead.closeNowPlaying(),
            ),
          },
          child: const Focus(autofocus: true, child: NowPlayingPage()),
        ),
      ),
    );
  }
}

// ───────────── Toast ─────────────

class ToastView extends StatelessWidget {
  const ToastView({super.key});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: ValueListenableBuilder<String?>(
        valueListenable: toast,
        builder: (_, s, _) => Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (c, a) => FadeTransition(
              opacity: a,
              child: SlideTransition(
                position: Tween(
                  begin: const Offset(0, 0.5),
                  end: Offset.zero,
                ).animate(a),
                child: c,
              ),
            ),
            child: s == null
                ? const SizedBox.shrink()
                : Container(
                    key: ValueKey(s),
                    height: 36,
                    constraints: const BoxConstraints(maxWidth: 560),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    decoration: squircle(
                      18,
                      color: const Color(0xFF2E2E33),
                      shadows: [
                        BoxShadow(
                          color: ba(0.4),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    // Shrink to the text: no alignment, or Container fills the whole row.
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: tx(s, 13, w: w700, c: const Color(0xFFF7F7F8)),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
