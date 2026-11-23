import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'l10n/l10n.dart';
import 'state.dart';

/// Global shortcuts: one table that keyboard handling, the macOS menu bar and the settings page reference all come from.
/// macOS uses ⌘ / ⌥ / ⇧; Windows uses Ctrl / Alt / Shift instead.
/// While typing, only [AppShortcut.whileTyping] ones (⌘F, Esc) work.

final bool _mac = Platform.isMacOS;

enum ShortcutGroup { playback, ui }

class AppShortcut {
  const AppShortcut({
    required this.id,
    required this.group,
    required this.label,
    required this.keys,
    required this.activators,
    required this.run,
    this.whileTyping = false,
    this.inMenu = true,
    this.repeatable = false,
  });

  final String id;

  /// Groups on the settings page: playback, interface.
  final ShortcutGroup group;
  final String Function(AppLocalizations l) label;

  /// Keycaps shown on the settings page (mac notation; [keysFor] converts to text on Windows);
  /// `null` is the "to" between keycaps, and `'SPACE'` becomes the localised space name via [keysFor].
  final List<String?> keys;
  final List<SingleActivator> activators;

  /// Returning false means it wasn't handled this time (e.g. Esc with Now Playing closed), so the key keeps propagating.
  final bool Function(AppState app) run;
  final bool whileTyping;

  /// Shown with its shortcut in the macOS menu bar. Arrow keys and space are left out: the system menu may get keys before text fields,
  /// stealing cursor movement and space input from them.
  final bool inMenu;

  /// Whether holding the key repeats (volume and seeking).
  final bool repeatable;
}

/// Primary modifier: ⌘ on mac, Ctrl on Windows.
SingleActivator _cmd(LogicalKeyboardKey k, {bool alt = false}) =>
    SingleActivator(k, meta: _mac, control: !_mac, alt: alt);

bool _do(void Function() f) {
  f();
  return true;
}

final List<AppShortcut> appShortcuts = [
  // ───── Playback ─────
  AppShortcut(
    id: 'playPause',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutPlayPause,
    keys: const ['SPACE'],
    activators: const [SingleActivator(LogicalKeyboardKey.space)],
    run: (a) => _do(a.togglePlay),
    inMenu: false,
  ),
  AppShortcut(
    id: 'next',
    group: ShortcutGroup.playback,
    label: (l) => l.actionNext,
    keys: const ['⌘', '→'],
    activators: [_cmd(LogicalKeyboardKey.arrowRight)],
    run: (a) => _do(a.next),
    inMenu: false,
  ),
  AppShortcut(
    id: 'prev',
    group: ShortcutGroup.playback,
    label: (l) => l.actionPrev,
    keys: const ['⌘', '←'],
    activators: [_cmd(LogicalKeyboardKey.arrowLeft)],
    run: (a) => _do(a.prev),
    inMenu: false,
  ),
  AppShortcut(
    id: 'seekForward',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutSeekForward,
    keys: const ['⇧', '→'],
    activators: const [
      SingleActivator(LogicalKeyboardKey.arrowRight, shift: true),
    ],
    run: (a) => _do(() => a.seekBy(5)),
    inMenu: false,
    repeatable: true,
  ),
  AppShortcut(
    id: 'seekBackward',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutSeekBackward,
    keys: const ['⇧', '←'],
    activators: const [
      SingleActivator(LogicalKeyboardKey.arrowLeft, shift: true),
    ],
    run: (a) => _do(() => a.seekBy(-5)),
    inMenu: false,
    repeatable: true,
  ),
  AppShortcut(
    id: 'volumeUp',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutVolumeUp,
    keys: const ['⌘', '↑'],
    activators: [_cmd(LogicalKeyboardKey.arrowUp)],
    run: (a) => _do(() => a.volumeBy(0.1)),
    inMenu: false,
    repeatable: true,
  ),
  AppShortcut(
    id: 'volumeDown',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutVolumeDown,
    keys: const ['⌘', '↓'],
    activators: [_cmd(LogicalKeyboardKey.arrowDown)],
    run: (a) => _do(() => a.volumeBy(-0.1)),
    inMenu: false,
    repeatable: true,
  ),
  AppShortcut(
    id: 'mute',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutMute,
    keys: const ['⌥', '⌘', '↓'],
    activators: [_cmd(LogicalKeyboardKey.arrowDown, alt: true)],
    run: (a) => _do(a.toggleMute),
    inMenu: false,
  ),
  AppShortcut(
    id: 'shuffle',
    group: ShortcutGroup.playback,
    label: (l) => l.actionShuffle,
    keys: const ['⌘', 'S'],
    activators: [_cmd(LogicalKeyboardKey.keyS)],
    run: (a) => _do(a.toggleShuffle),
  ),
  AppShortcut(
    id: 'repeat',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutRepeat,
    keys: const ['⌘', 'R'],
    activators: [_cmd(LogicalKeyboardKey.keyR)],
    run: (a) => _do(a.toggleRepeat),
  ),
  AppShortcut(
    id: 'likeCurrent',
    group: ShortcutGroup.playback,
    label: (l) => l.shortcutLikeCurrent,
    keys: const ['⌘', 'L'],
    activators: [_cmd(LogicalKeyboardKey.keyL)],
    run: (a) => _do(a.toggleLike),
  ),
  // ───── Interface ─────
  AppShortcut(
    id: 'nowPlaying',
    group: ShortcutGroup.ui,
    label: (l) => l.miniOpenNowPlaying,
    keys: const ['⌘', 'P'],
    activators: [_cmd(LogicalKeyboardKey.keyP)],
    run: (a) => _do(() => a.npOpen ? a.closeNowPlaying() : a.openNowPlaying()),
  ),
  AppShortcut(
    id: 'dismiss',
    group: ShortcutGroup.ui,
    label: (l) => l.shortcutDismissOverlay,
    keys: const ['Esc'],
    activators: const [SingleActivator(LogicalKeyboardKey.escape)],
    // Only handles Now Playing; dialogs take Esc themselves (passed on to them when unhandled)
    run: (a) {
      if (!a.npOpen) return false;
      a.closeNowPlaying();
      return true;
    },
    whileTyping: true,
    inMenu: false,
  ),
  AppShortcut(
    id: 'search',
    group: ShortcutGroup.ui,
    label: (l) => l.navSearch,
    keys: const ['⌘', 'F'],
    activators: [_cmd(LogicalKeyboardKey.keyF)],
    run: (a) => _do(() {
      a.closeNowPlaying();
      a.focusSearch();
    }),
    whileTyping: true,
  ),
  AppShortcut(
    id: 'back',
    group: ShortcutGroup.ui,
    label: (l) => l.shortcutBack,
    keys: const ['⌘', '['],
    activators: [_cmd(LogicalKeyboardKey.bracketLeft)],
    run: (a) => _do(a.back),
  ),
  AppShortcut(
    id: 'forward',
    group: ShortcutGroup.ui,
    label: (l) => l.shortcutForward,
    keys: const ['⌘', ']'],
    activators: [_cmd(LogicalKeyboardKey.bracketRight)],
    run: (a) => _do(a.forward),
  ),
  AppShortcut(
    id: 'settings',
    group: ShortcutGroup.ui,
    label: (l) => l.navSettings,
    keys: const ['⌘', ','],
    activators: [_cmd(LogicalKeyboardKey.comma)],
    run: (a) => _do(() {
      a.closeNowPlaying();
      a.go('/settings');
    }),
  ),
  AppShortcut(
    id: 'switchTab',
    group: ShortcutGroup.ui,
    label: (l) => l.shortcutSwitchTab,
    keys: const ['⌘', '1', null, '4'],
    activators: [
      _cmd(LogicalKeyboardKey.digit1),
      _cmd(LogicalKeyboardKey.digit2),
      _cmd(LogicalKeyboardKey.digit3),
      _cmd(LogicalKeyboardKey.digit4),
    ],
    // Which page to go to is computed from the key in [_onKey]
    run: (_) => true,
    inMenu: false,
  ),
];

const _digits = [
  LogicalKeyboardKey.digit1,
  LogicalKeyboardKey.digit2,
  LogicalKeyboardKey.digit3,
  LogicalKeyboardKey.digit4,
];

/// Keycap text for the settings page: Windows replaces the symbols with Ctrl / Alt / Shift.
List<String?> keysFor(AppShortcut s, AppLocalizations l) => [
  for (final k in s.keys)
    k == 'SPACE'
        ? l.shortcutSpaceKey
        : (_mac
              ? k
              : switch (k) {
                  '⌘' => 'Ctrl',
                  '⌥' => 'Alt',
                  '⇧' => 'Shift',
                  _ => k,
                }),
];

/// Focus is in a text field (the user is typing).
bool get _typing {
  final c = FocusManager.instance.primaryFocus?.context;
  if (c == null) return false;
  return c.widget is EditableText ||
      c.findAncestorWidgetOfExactType<EditableText>() != null;
}

/// Installs a global handler on [HardwareKeyboard]: it gets keys before focus handling in pages,
/// so space in the shelf or Coverflow isn't handled twice.
class ShortcutHandler {
  ShortcutHandler(this.app);
  final AppState app;

  void attach() => HardwareKeyboard.instance.addHandler(_onKey);
  void detach() => HardwareKeyboard.instance.removeHandler(_onKey);

  bool _onKey(KeyEvent e) {
    if (e is KeyUpEvent) return false;
    final typing = _typing;
    for (final s in appShortcuts) {
      if (typing && !s.whileTyping) continue;
      for (final a in s.activators) {
        if (!a.accepts(e, HardwareKeyboard.instance)) continue;
        // Key repeat only for volume and seeking
        if (e is KeyRepeatEvent && !s.repeatable) {
          return true;
        }
        if (_digits.contains(a.trigger)) {
          // ⌘1–4 follow the order shown in the sidebar (shifted forward when there's no home or Discover)
          final tabs = app.visibleTabs;
          final i = _digits.indexOf(a.trigger);
          if (i < tabs.length) {
            app.closeNowPlaying();
            app.goTab(tabs[i]);
          }
          return true;
        }
        return s.run(app);
      }
    }
    return false;
  }
}

/// macOS menu bar: app, playback, view, window. Items with shortcuts fire only once when pressed —
/// if keyboard handling gets the key first the menu doesn't run; menu items also don't run while typing (except ⌘F).
class AppMenuBar extends StatelessWidget {
  const AppMenuBar({super.key, required this.app, required this.child});
  final AppState app;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!_mac) return child;
    final l = context.l10n;
    AppShortcut by(String id) => appShortcuts.firstWhere((s) => s.id == id);
    PlatformMenuItem item(String id, {String? title}) {
      final s = by(id);
      return PlatformMenuItem(
        label: title ?? s.label(l),
        shortcut: s.inMenu ? s.activators.first : null,
        onSelected: () {
          if (_typing && !s.whileTyping) return;
          s.run(app);
        },
      );
    }

    PlatformMenuItem tab(int i, String label) => PlatformMenuItem(
      label: label,
      onSelected: () {
        if (_typing) return;
        app.closeNowPlaying();
        app.goTab(i);
      },
    );

    return PlatformMenuBar(
      menus: [
        PlatformMenu(
          label: 'YesPlayMusic',
          menus: [
            const PlatformMenuItemGroup(
              members: [
                PlatformProvidedMenuItem(
                  type: PlatformProvidedMenuItemType.about,
                ),
              ],
            ),
            PlatformMenuItemGroup(
              members: [item('settings', title: l.menuBarSettings)],
            ),
            const PlatformMenuItemGroup(
              members: [
                PlatformProvidedMenuItem(
                  type: PlatformProvidedMenuItemType.hide,
                ),
                PlatformProvidedMenuItem(
                  type: PlatformProvidedMenuItemType.hideOtherApplications,
                ),
                PlatformProvidedMenuItem(
                  type: PlatformProvidedMenuItemType.showAllApplications,
                ),
              ],
            ),
            const PlatformMenuItemGroup(
              members: [
                PlatformProvidedMenuItem(
                  type: PlatformProvidedMenuItemType.quit,
                ),
              ],
            ),
          ],
        ),
        PlatformMenu(
          label: l.shortcutGroupPlayback,
          menus: [
            PlatformMenuItemGroup(
              members: [item('playPause'), item('next'), item('prev')],
            ),
            PlatformMenuItemGroup(
              members: [item('seekForward'), item('seekBackward')],
            ),
            PlatformMenuItemGroup(
              members: [item('volumeUp'), item('volumeDown'), item('mute')],
            ),
            PlatformMenuItemGroup(
              members: [item('shuffle'), item('repeat'), item('likeCurrent')],
            ),
          ],
        ),
        PlatformMenu(
          label: l.menuBarView,
          menus: [
            PlatformMenuItemGroup(
              members: [
                item('nowPlaying', title: l.npTitle),
                item('search'),
              ],
            ),
            PlatformMenuItemGroup(members: [item('back'), item('forward')]),
            PlatformMenuItemGroup(
              members: [
                if (app.hasHome) tab(0, l.navHome),
                if (app.hasDiscover) tab(1, l.navDiscover),
                tab(2, l.navLibrary),
                tab(3, l.navSearchPage),
              ],
            ),
          ],
        ),
        PlatformMenu(
          label: l.menuBarWindow,
          menus: const [
            PlatformProvidedMenuItem(
              type: PlatformProvidedMenuItemType.minimizeWindow,
            ),
            PlatformProvidedMenuItem(
              type: PlatformProvidedMenuItemType.zoomWindow,
            ),
            PlatformProvidedMenuItem(
              type: PlatformProvidedMenuItemType.toggleFullScreen,
            ),
          ],
        ),
      ],
      child: child,
    );
  }
}
