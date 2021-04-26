const { globalShortcut } = require('electron');

export function registerGlobalShortcut(win) {
  globalShortcut.register('Alt+CommandOrControl+P', () => {
    win.webContents.send('play');
  });
  globalShortcut.register('Alt+CommandOrControl+Right', () => {
    win.webContents.send('next');
  });
  globalShortcut.register('Alt+CommandOrControl+Left', () => {
    win.webContents.send('previous');
  });
  globalShortcut.register('Alt+CommandOrControl+Up', () => {
    win.webContents.send('increaseVolume');
  });
  globalShortcut.register('Alt+CommandOrControl+Down', () => {
    win.webContents.send('decreaseVolume');
  });
  globalShortcut.register('Alt+CommandOrControl+L', () => {
    win.webContents.send('like');
  });
}
