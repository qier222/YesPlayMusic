const { Menu } = require('electron');

export function createDockMenu(win) {
  return Menu.buildFromTemplate([
    {
      label: 'Play',
      click() {
        win.webContents.send('play');
      },
    },
    { type: 'separator' },
    {
      label: 'Next',
      click() {
        win.webContents.send('next');
      },
    },
    {
      label: 'Previous',
      click() {
        win.webContents.send('previous');
      },
    },
  ]);
}
