import defaultShortcuts from '@/utils/shortcuts';
const { app, Menu } = require('electron');
// import { autoUpdater } from "electron-updater"
// const version = app.getVersion();

const isMac = process.platform === 'darwin';

export function createMenu(win, store) {
  let shortcuts = store.get('settings.shortcuts');
  if (shortcuts === undefined) {
    shortcuts = defaultShortcuts;
  }

  let menu = null;
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { type: 'separator' },
              {
                label: 'Preferences...',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                  win.webContents.send('changeRouteTo', '/settings');
                },
                role: 'preferences',
              },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            win.webContents.send('search');
          },
        },
      ],
    },
    {
      label: 'Controls',
      submenu: [
        {
          label: 'Play',
          accelerator: shortcuts.find(s => s.id === 'play').shortcut,
          click: () => {
            win.webContents.send('play');
          },
        },
        {
          label: 'Next',
          accelerator: shortcuts.find(s => s.id === 'next').shortcut,
          click: () => {
            win.webContents.send('next');
          },
        },
        {
          label: 'Previous',
          accelerator: shortcuts.find(s => s.id === 'previous').shortcut,
          click: () => {
            win.webContents.send('previous');
          },
        },
        {
          label: 'Increase Volume',
          accelerator: shortcuts.find(s => s.id === 'increaseVolume').shortcut,
          click: () => {
            win.webContents.send('increaseVolume');
          },
        },
        {
          label: 'Decrease Volume',
          accelerator: shortcuts.find(s => s.id === 'decreaseVolume').shortcut,
          click: () => {
            win.webContents.send('decreaseVolume');
          },
        },
        {
          label: 'Like',
          accelerator: shortcuts.find(s => s.id === 'like').shortcut,
          click: () => {
            win.webContents.send('like');
          },
        },
        {
          label: 'Repeat',
          accelerator: 'Alt+R',
          click: () => {
            win.webContents.send('repeat');
          },
        },
        {
          label: 'Shuffle',
          accelerator: 'Alt+S',
          click: () => {
            win.webContents.send('shuffle');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              {
                role: 'window',
                id: 'window',
                label: 'YesPlayMusic',
                type: 'checkbox',
                checked: true,
                click: () => {
                  const current = menu.getMenuItemById('window');
                  if (current.checked === false) {
                    win.hide();
                  } else {
                    win.show();
                  }
                },
              },
            ]
          : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/qier222/YesPlayMusic');
          },
        },
        {
          label: 'Electron',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            win.webContents.openDevTools();
          },
        },
      ],
    },
  ];
  // for window
  // if (process.platform === "win32") {
  //   template.push({
  //     label: "Help",
  //     submenu: [
  //       {
  //         label: `Current version v${version}`,
  //         enabled: false,
  //       },
  //       {
  //         label: "Check for update",
  //         accelerator: "Ctrl+U",
  //         click: (item, focusedWindow) => {
  //           win = focusedWindow;
  //           updateSource = "menu";
  //           autoUpdater.checkForUpdates();
  //         },
  //       },
  //     ],
  //   });
  // }

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
