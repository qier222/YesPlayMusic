import defaultShortcuts from '@/utils/shortcuts';
const { globalShortcut } = require('electron');

const clc = require('cli-color');
const log = text => {
  console.log(`${clc.blueBright('[globalShortcut.js]')} ${text}`);
};

function getShortcut(shortcuts, id) {
  return (
    shortcuts.find(s => s.id === id) || defaultShortcuts.find(s => s.id === id)
  );
}

function register(shortcuts, id, callback) {
  const shortcutConfig = getShortcut(shortcuts, id);
  const shortcut = shortcutConfig && shortcutConfig.globalShortcut;
  if (!shortcut) return;
  globalShortcut.register(shortcut, callback);
}

export function registerGlobalShortcut(win, store, desktopLyrics) {
  log('registerGlobalShortcut');
  globalShortcut.unregisterAll();
  let shortcuts = store.get('settings.shortcuts');
  if (shortcuts === undefined) {
    shortcuts = defaultShortcuts;
  }

  register(shortcuts, 'play', () => {
    win.webContents.send('play');
  });
  register(shortcuts, 'next', () => {
    win.webContents.send('next');
  });
  register(shortcuts, 'previous', () => {
    win.webContents.send('previous');
  });
  register(shortcuts, 'increaseVolume', () => {
    win.webContents.send('increaseVolume');
  });
  register(shortcuts, 'decreaseVolume', () => {
    win.webContents.send('decreaseVolume');
  });
  register(shortcuts, 'like', () => {
    win.webContents.send('like');
  });
  register(shortcuts, 'minimize', () => {
    win.isVisible() ? win.hide() : win.show();
  });
  register(shortcuts, 'toggleDesktopLyrics', () => {
    if (desktopLyrics) {
      desktopLyrics.toggle();
    }
  });
}
