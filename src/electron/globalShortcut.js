import defaultShortcuts from '@/utils/shortcuts';
const { globalShortcut } = require('electron');

const clc = require('cli-color');
const log = text => {
  console.log(`${clc.blueBright('[globalShortcut.js]')} ${text}`);
};

const shortcutConfig = new Map([
  ['play', win => win.webContents.send('play')],
  ['next', win => win.webContents.send('next')],
  ['previous', win => win.webContents.send('previous')],
  ['increaseVolume', win => win.webContents.send('increaseVolume')],
  ['decreaseVolume', win => win.webContents.send('decreaseVolume')],
  ['like', win => win.webContents.send('like')],
  ['minimize', win => (win.isVisible() ? win.hide() : win.show())],
]);

function safeRegister(key, cb) {
  if (!key || key.trim() === '') return;
  if (globalShortcut.isRegistered(key)) globalShortcut.unregister(key);
  globalShortcut.register(key, cb);
}

export function registerGlobalShortcut(win, store) {
  log('registerGlobalShortcut');
  let shortcuts = store.get('settings.shortcuts');
  if (shortcuts === undefined) {
    shortcuts = defaultShortcuts;
  }

  for (let i = 0; i < shortcuts.length; i++) {
    const shortcut = shortcuts[i];
    const callback = shortcutConfig.get(shortcut.id);
    safeRegister(shortcut.globalShortcut, () => callback(win));
  }
}
