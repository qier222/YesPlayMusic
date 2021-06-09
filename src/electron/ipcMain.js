import { app, dialog, globalShortcut, ipcMain } from 'electron';
import match from '@revincx/unblockneteasemusic';
import { registerGlobalShortcut } from '@/electron/globalShortcut';
import cloneDeep from 'lodash/cloneDeep';
import shortcuts from '@/utils/shortcuts';
import { createMenu } from './menu';

const clc = require('cli-color');
const log = text => {
  console.log(`${clc.blueBright('[ipcMain.js]')} ${text}`);
};

const client = require('discord-rich-presence')('818936529484906596');

export function initIpcMain(win, store, lrc) {
  ipcMain.on('unblock-music', (event, track) => {
    // 兼容 unblockneteasemusic 所使用的 api 字段
    track.alias = track.alia || [];
    track.duration = track.dt || 0;
    track.album = track.al || [];
    track.artists = track.ar || [];

    const matchPromise = match(track.id, ['qq', 'kuwo', 'migu'], track);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject('timeout');
      }, 3000);
    });
    Promise.race([matchPromise, timeoutPromise])
      .then(res => {
        event.returnValue = res;
      })
      .catch(err => {
        log('unblock music error: ', err);
        event.returnValue = null;
      });
  });

  ipcMain.on('close', e => {
    if (process.platform == 'darwin') {
      win.hide();
    }
    e.preventDefault(); //阻止默认行为
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Information',
        cancelId: 2,
        defaultId: 0,
        message: '确定要关闭吗？',
        buttons: ['最小化', '直接退出'],
      })
      .then(result => {
        if (result.response == 0) {
          e.preventDefault(); //阻止默认行为
          win.minimize(); //调用 最小化实例方法
        } else if (result.response == 1) {
          win = null;
          //app.quit();
          app.exit(); //exit()直接关闭客户端，不会执行quit();
        }
      })
      .catch(err => {
        log(err);
      });
  });

  ipcMain.on('minimize', () => {
    win.minimize();
  });

  ipcMain.on('maximizeOrUnmaximize', () => {
    const isMaximized = win.isMaximized();
    isMaximized ? win.unmaximize() : win.maximize();
    win.webContents.send('isMaximized', isMaximized);
  });

  ipcMain.on('settings', (event, options) => {
    store.set('settings', options);
    if (options.enableGlobalShortcut) {
      registerGlobalShortcut(win, store);
    } else {
      globalShortcut.unregisterAll();
    }
  });

  ipcMain.on('playDiscordPresence', (event, track) => {
    client.updatePresence({
      details: track.name + ' - ' + track.ar.map(ar => ar.name).join(','),
      state: track.al.name,
      endTimestamp: Date.now() + track.dt,
      largeImageKey: 'logo',
      largeImageText: 'Listening ' + track.name,
      smallImageKey: 'play',
      smallImageText: 'Playing',
      instance: true,
    });
  });

  ipcMain.on('pauseDiscordPresence', (event, track) => {
    client.updatePresence({
      details: track.name + ' - ' + track.ar.map(ar => ar.name).join(','),
      state: track.al.name,
      largeImageKey: 'logo',
      largeImageText: 'YesPlayMusic',
      smallImageKey: 'pause',
      smallImageText: 'Pause',
      instance: true,
    });
  });

  ipcMain.on('setProxy', (event, config) => {
    const proxyRules = `${config.protocol}://${config.server}:${config.port}`;
    store.set('proxy', proxyRules);
    win.webContents.session.setProxy(
      {
        proxyRules,
      },
      () => {
        log('finished setProxy');
      }
    );
  });

  ipcMain.on('removeProxy', (event, arg) => {
    log('removeProxy');
    win.webContents.session.setProxy({});
    store.set('proxy', '');
  });

  ipcMain.on('resizeOSDLyrics', (event, arg) => {
    lrc.resizeOSDLyrics(arg);
  });

  ipcMain.on('toggleOSDLyrics', () => {
    lrc.toggleOSDLyrics();
  });

  ipcMain.on('switchGlobalShortcutStatusTemporary', (e, status) => {
    if (status === 'disable') {
      globalShortcut.unregisterAll();
    } else {
      registerGlobalShortcut(win, store);
    }
  });

  ipcMain.on('updateShortcut', (e, { id, type, shortcut }) => {
    log('updateShortcut');
    let shortcuts = store.get('settings.shortcuts');
    let newShortcut = shortcuts.find(s => s.id === id);
    newShortcut[type] = shortcut;
    store.set('settings.shortcuts', shortcuts);

    createMenu(win, store);
    globalShortcut.unregisterAll();
    registerGlobalShortcut(win, store);
  });

  ipcMain.on('restoreDefaultShortcuts', () => {
    log('restoreDefaultShortcuts');
    store.set('settings.shortcuts', cloneDeep(shortcuts));

    createMenu(win, store);
    globalShortcut.unregisterAll();
    registerGlobalShortcut(win, store);
  });
}
