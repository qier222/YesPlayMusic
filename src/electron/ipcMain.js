import { app, dialog, globalShortcut, ipcMain } from 'electron';
import match from '@njzy/unblockneteasemusic';
import { registerGlobalShortcut } from '@/electron/globalShortcut';

const client = require('discord-rich-presence')('818936529484906596');

export function initIpcMain(win, store) {
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
        console.log('unblock music error: ', err);
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
        console.log(err);
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
    const isRegisterShortcut = globalShortcut.isRegistered(
      'Alt+CommandOrControl+P'
    );
    if (options.enableGlobalShortcut) {
      !isRegisterShortcut && registerGlobalShortcut(win);
    } else {
      isRegisterShortcut && globalShortcut.unregisterAll();
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
    console.log(config);
    const proxyRules = `${config.protocol}://${config.server}:${config.port}`;
    win.webContents.session.setProxy(
      {
        proxyRules,
      },
      () => {
        console.log('finished setProxy');
      }
    );
  });

  ipcMain.on('removeProxy', (event, arg) => {
    console.log('removeProxy');
    win.webContents.session.setProxy({});
  });
}
