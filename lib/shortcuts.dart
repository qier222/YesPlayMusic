import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'l10n/l10n.dart';
import 'state.dart';

/// 全局快捷键：一张表，键盘处理、macOS 菜单栏、设置页的说明都从这里来。
/// macOS 用 ⌘ / ⌥ / ⇧，Windows 换成 Ctrl / Alt / Shift。
/// 正在输入文字时只有 [AppShortcut.whileTyping] 的（⌘F、Esc）生效。

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

  /// 设置页里的分组：播放、界面。
  final ShortcutGroup group;
  final String Function(AppLocalizations l) label;

  /// 设置页里显示的键帽（mac 写法，Windows 由 [keysFor] 换成文字）；
  /// `null` 是键帽之间的「到」，`'SPACE'` 由 [keysFor] 换成本地化空格名。
  final List<String?> keys;
  final List<SingleActivator> activators;

  /// 返回 false 表示这次没处理（比如没打开正在播放时按 Esc），按键接着往下传。
  final bool Function(AppState app) run;
  final bool whileTyping;

  /// macOS 菜单栏里带快捷键。方向键和空格不放：系统菜单可能先于输入框拿到按键，
  /// 会抢掉输入框里移动光标、输入空格。
  final bool inMenu;

  /// 是否允许长按重复触发（音量和快进快退）。
  final bool repeatable;
}

/// 主修饰键：mac ⌘，Windows Ctrl。
SingleActivator _cmd(LogicalKeyboardKey k, {bool alt = false}) =>
    SingleActivator(k, meta: _mac, control: !_mac, alt: alt);

bool _do(void Function() f) {
  f();
  return true;
}

final List<AppShortcut> appShortcuts = [
  // ───── 播放 ─────
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
  // ───── 界面 ─────
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
    // 只管正在播放；弹窗自己接 Esc（没处理就往下传给它们）
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
    // 具体去第几页在 [_onKey] 里按按键算
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

/// 设置页显示用的键帽文字：Windows 把符号换成 Ctrl / Alt / Shift。
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

/// 焦点在输入框里（正在输入文字）。
bool get _typing {
  final c = FocusManager.instance.primaryFocus?.context;
  if (c == null) return false;
  return c.widget is EditableText ||
      c.findAncestorWidgetOfExactType<EditableText>() != null;
}

/// 在 [HardwareKeyboard] 上挂全局处理：比页面里的焦点处理更早拿到按键，
/// 所以书架、Coverflow 里的空格不会被处理两次。
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
        // 重复按住只给音量和快进快退
        if (e is KeyRepeatEvent && !s.repeatable) {
          return true;
        }
        if (_digits.contains(a.trigger)) {
          // ⌘1～4 按侧边栏上显示的顺序（没有首页、发现时往前补）
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

/// macOS 菜单栏：应用、播放、显示、窗口。带快捷键的项按下时只会触发一次——
/// 键盘处理先拿到就不会再走菜单；输入文字时菜单项也不执行（⌘F 除外）。
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
