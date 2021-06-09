'use strict';
import {
  app,
  protocol,
  BrowserWindow,
  shell,
  dialog,
  globalShortcut,
  nativeTheme,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { startNeteaseMusicApi } from './electron/services';
import { initIpcMain } from './electron/ipcMain.js';
import { createMenu } from './electron/menu';
import { createTray } from '@/electron/tray';
import { createTouchBar } from './electron/touchBar';
import { createDockMenu } from './electron/dockMenu';
import { registerGlobalShortcut } from './electron/globalShortcut';
import { autoUpdater } from 'electron-updater';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import express from 'express';
import expressProxy from 'express-http-proxy';
import Store from 'electron-store';
const clc = require('cli-color');
const log = text => {
  console.log(`${clc.blueBright('[background.js]')} ${text}`);
};

class Background {
  constructor() {
    this.window = null;
    this.osdlyrics = null;
    this.tray = null;
    this.store = new Store({
      windowWidth: {
        width: { type: 'number', default: 1440 },
        height: { type: 'number', default: 840 },
      },
    });
    this.neteaseMusicAPI = null;
    this.expressApp = null;
    this.willQuitApp = process.platform === 'darwin' ? false : true;

    this.init();
  }

  init() {
    log('initializing');

    // Make sure the app is singleton.
    if (!app.requestSingleInstanceLock()) return app.quit();

    // start netease music api
    this.neteaseMusicAPI = startNeteaseMusicApi();

    // create Express app
    this.createExpressApp();

    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true } },
    ]);

    // handle app events
    this.handleAppEvents();
  }

  async initDevtools() {
    // Install Vue Devtools extension
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }

    // Exit cleanly on request from parent process in development mode.
    if (process.platform === 'win32') {
      process.on('message', data => {
        if (data === 'graceful-exit') {
          app.quit();
        }
      });
    } else {
      process.on('SIGTERM', () => {
        app.quit();
      });
    }
  }

  createExpressApp() {
    log('creating express app');

    const expressApp = express();
    expressApp.use('/', express.static(__dirname + '/'));
    expressApp.use('/api', expressProxy('http://127.0.0.1:10754'));
    expressApp.use('/player', (req, res) => {
      this.window.webContents
        .executeJavaScript('window.yesplaymusic.player')
        .then(result => {
          res.send({
            currentTrack: result._isPersonalFM
              ? result._personalFMTrack
              : result._currentTrack,
            progress: result._progress,
          });
        });
    });
    this.expressApp = expressApp.listen(27232, '127.0.0.1');
  }

  createWindow() {
    log('creating app window');

    const appearance = this.store.get('settings.appearance');
    const showLibraryDefault = this.store.get('settings.showLibraryDefault');

    const options = {
      width: this.store.get('window.width') || 1440,
      height: this.store.get('window.height') || 840,
      minWidth: 1080,
      minHeight: 720,
      titleBarStyle: 'hiddenInset',
      frame: process.platform !== 'win32',
      title: 'YesPlayMusic',
      show: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      backgroundColor:
        ((appearance === undefined || appearance === 'auto') &&
          nativeTheme.shouldUseDarkColors) ||
        appearance === 'dark'
          ? '#222'
          : '#fff',
    };

    if (this.store.get('window.x') && this.store.get('window.y')) {
      options.x = this.store.get('window.x');
      options.y = this.store.get('window.y');
    }

    this.window = new BrowserWindow(options);

    // hide menu bar on Microsoft Windows and Linux
    this.window.setMenuBarVisibility(false);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      this.window.loadURL(
        showLibraryDefault
          ? `${process.env.WEBPACK_DEV_SERVER_URL}/#/library`
          : process.env.WEBPACK_DEV_SERVER_URL
      );
      if (!process.env.IS_TEST) this.window.webContents.openDevTools();
    } else {
      createProtocol('app');
      this.window.loadURL(
        showLibraryDefault
          ? 'http://localhost:27232/#/library'
          : 'http://localhost:27232'
      );
    }
  }

  createOSDWindow() {
    this.osdlyrics = new BrowserWindow({
      x: this.store.get('osdlyrics.x-pos') || 0,
      y: this.store.get('osdlyrics.y-pos') || 0,
      width: this.store.get('osdlyrics.width') || 840,
      height: this.store.get('osdlyrics.height') || 110,
      title: 'OSD Lyrics',
      transparent: true,
      frame: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    this.osdlyrics.setAlwaysOnTop(true, 'screen');

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      this.osdlyrics.loadURL(
        process.env.WEBPACK_DEV_SERVER_URL + '/osdlyrics.html'
      );
      if (!process.env.IS_TEST) this.osdlyrics.webContents.openDevTools();
    } else {
      this.osdlyrics.loadURL('http://localhost:27232/osdlyrics.html');
    }
  }

  initOSDLyrics() {
    const osdState = this.store.get('osdlyrics.show') || false;
    if (osdState) {
      this.showOSDLyrics();
    }
  }

  toggleOSDLyrics() {
    const osdState = this.store.get('osdlyrics.show') || false;
    if (osdState) {
      this.hideOSDLyrics();
    } else {
      this.showOSDLyrics();
    }
  }

  showOSDLyrics() {
    this.store.set('osdlyrics.show', true);
    if (!this.osdlyrics) {
      this.createOSDWindow();
      this.handleOSDEvents();
    }
  }

  hideOSDLyrics() {
    this.store.set('osdlyrics.show', false);
    if (this.osdlyrics) {
      this.osdlyrics.close();
    }
  }

  resizeOSDLyrics(height) {
    const width = this.store.get('osdlyrics.width') || 840;
    this.osdlyrics.setSize(width, height);
  }

  checkForUpdates() {
    if (process.env.NODE_ENV === 'development') return;
    log('checkForUpdates');
    autoUpdater.checkForUpdatesAndNotify();

    const showNewVersionMessage = info => {
      dialog
        .showMessageBox({
          title: '发现新版本 v' + info.version,
          message: '发现新版本 v' + info.version,
          detail: '是否前往 GitHub 下载新版本安装包？',
          buttons: ['下载', '取消'],
          type: 'question',
          noLink: true,
        })
        .then(result => {
          if (result.response === 0) {
            shell.openExternal(
              'https://github.com/qier222/YesPlayMusic/releases'
            );
          }
        });
    };

    autoUpdater.on('update-available', info => {
      showNewVersionMessage(info);
    });
  }

  handleOSDEvents() {
    this.osdlyrics.once('ready-to-show', () => {
      log('OSD ready-to-show event');
      this.osdlyrics.show();
    });

    this.osdlyrics.on('closed', e => {
      log('OSD close event');
      this.osdlyrics = null;
    });

    this.osdlyrics.on('resized', () => {
      let { height, width } = this.osdlyrics.getBounds();
      this.store.set('osdlyrics.width', width);
      this.store.set('osdlyrics.height', height);
    });

    this.osdlyrics.on('moved', () => {
      var pos = this.osdlyrics.getPosition();
      this.store.set('osdlyrics.x-pos', pos[0]);
      this.store.set('osdlyrics.y-pos', pos[1]);
    });
  }

  handleWindowEvents() {
    this.window.once('ready-to-show', () => {
      log('windows ready-to-show event');
      this.window.show();
    });

    this.window.on('close', e => {
      log('windows close event');
      if (this.willQuitApp) {
        /* the user tried to quit the app */
        this.window = null;
        app.quit();
      } else {
        /* the user only tried to close the window */
        e.preventDefault();
        this.window.hide();
      }
    });

    this.window.on('resized', () => {
      this.store.set('window', this.window.getBounds());
    });

    this.window.on('moved', () => {
      this.store.set('window', this.window.getBounds());
    });

    this.window.on('minimize', () => {
      if (
        ['win32', 'linux'].includes(process.platform) &&
        this.store.get('settings.minimizeToTray')
      ) {
        this.window.hide();
      }
    });

    this.window.webContents.on('new-window', function (e, url) {
      e.preventDefault();
      log('open url');
      const excludeHosts = ['www.last.fm'];
      const exclude = excludeHosts.find(host => url.includes(host));
      if (exclude) {
        const newWindow = new BrowserWindow({
          width: 800,
          height: 600,
          titleBarStyle: 'default',
          title: 'YesPlayMusic',
          webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
          },
        });
        newWindow.loadURL(url);
        return;
      }
      shell.openExternal(url);
    });
  }

  handleAppEvents() {
    app.on('ready', async () => {
      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      log('app ready event');

      // for development
      if (process.env.NODE_ENV === 'development') {
        this.initDevtools();
      }

      // create window
      this.createWindow();
      this.window.once('ready-to-show', () => {
        this.window.show();
      });
      this.handleWindowEvents();

      this.initOSDLyrics();

      // init ipcMain
      initIpcMain(this.window, this.store, {
        resizeOSDLyrics: height => this.resizeOSDLyrics(height),
        toggleOSDLyrics: () => this.toggleOSDLyrics(),
      });

      // set proxy
      const proxyRules = this.store.get('proxy');
      if (proxyRules) {
        this.window.webContents.session.setProxy({ proxyRules }, result => {
          log('finished setProxy', result);
        });
      }

      // check for updates
      this.checkForUpdates();

      // create menu
      createMenu(this.window, this.store);

      // create tray
      if (
        ['win32', 'linux'].includes(process.platform) ||
        process.env.NODE_ENV === 'development'
      ) {
        this.tray = createTray(this.window);
      }

      // create dock menu for macOS
      app.dock.setMenu(createDockMenu(this.window));

      // create touch bar
      this.window.setTouchBar(createTouchBar(this.window));

      // register global shortcuts
      if (this.store.get('settings.enableGlobalShortcut')) {
        registerGlobalShortcut(this.window, this.store);
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      log('app activate event');
      if (this.window === null) {
        this.createWindow();
      } else {
        this.window.show();
      }
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', () => {
      this.willQuitApp = true;
    });

    app.on('quit', () => {
      this.expressApp.close();
    });

    app.on('will-quit', () => {
      // unregister all global shortcuts
      globalShortcut.unregisterAll();
    });
  }
}

new Background();
