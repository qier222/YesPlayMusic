const { BrowserWindow, Menu, ipcMain } = require('electron');
import { isLinux, isMac } from '@/utils/platform';
import {
  normalizeDesktopLyricsSettings,
  updateDesktopLyricsSettings,
} from '@/utils/desktopLyrics';

const DEFAULT_STATE = {
  status: 'idle',
  trackId: null,
  currentLine: null,
  nextLine: null,
  playing: false,
  progress: 0,
};

export class DesktopLyricsManager {
  constructor(mainWindow, store) {
    this.mainWindow = mainWindow;
    this.store = store;
    this.window = null;
    this.lastState = DEFAULT_STATE;
    this.isQuitting = false;
    this.resizeSaveTimer = null;
    this.ipcHandlers = [];

    this.registerIpc();
  }

  get settings() {
    const settings = this.store.get('settings') || {};
    return {
      ...normalizeDesktopLyricsSettings(settings.desktopLyrics),
      lang: settings.lang || 'en',
    };
  }

  getLoadUrl() {
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      return `${process.env.WEBPACK_DEV_SERVER_URL}/desktopLyrics.html`;
    }
    return 'http://localhost:27232/desktopLyrics.html';
  }

  createWindow() {
    if (this.window && !this.window.isDestroyed()) return this.window;

    const settings = this.settings;
    const options = {
      width: settings.width,
      height: settings.height,
      minWidth: 360,
      minHeight: 92,
      frame: false,
      transparent: true,
      resizable: true,
      alwaysOnTop: settings.alwaysOnTop,
      skipTaskbar: true,
      show: false,
      hasShadow: false,
      title: 'Desktop Lyrics',
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    };

    if (Number.isFinite(settings.x) && Number.isFinite(settings.y)) {
      options.x = settings.x;
      options.y = settings.y;
    }

    try {
      this.window = new BrowserWindow(options);
    } catch (error) {
      console.warn(
        '[desktopLyrics] failed to create transparent window',
        error
      );
      return null;
    }

    this.window.setMenuBarVisibility(false);
    this.applyAlwaysOnTop(settings.alwaysOnTop);
    this.applyLock(settings.locked);
    this.window.loadURL(this.getLoadUrl());

    this.window.once('ready-to-show', () => {
      if (this.settings.visible) this.window.showInactive();
      this.sendSettingsToWindow();
      this.sendStateToWindow();
    });

    this.window.on('moved', () => this.persistBoundsSoon());
    this.window.on('resized', () => this.persistBoundsSoon());
    this.window.on('close', event => {
      if (this.isQuitting) return;
      event.preventDefault();
      this.hide();
    });
    this.window.on('closed', () => {
      this.window = null;
    });
    this.window.webContents.on('context-menu', () => this.openContextMenu());

    return this.window;
  }

  show(persist = true) {
    const win = this.createWindow();
    if (!win) return;
    if (persist) {
      this.persistSettings({ enabled: true, visible: true });
    } else {
      this.sendSettingsToWindow();
    }
    win.showInactive();
  }

  hide(persist = true) {
    if (this.window && !this.window.isDestroyed()) this.window.hide();
    if (persist) this.persistSettings({ visible: false });
  }

  toggle() {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  applySettings(settings) {
    const nextSettings = normalizeDesktopLyricsSettings(settings);

    if (nextSettings.enabled && nextSettings.visible) {
      this.show(false);
    } else if (this.window && !this.window.isDestroyed()) {
      if (!nextSettings.visible || !nextSettings.enabled) this.hide(false);
    }

    if (!this.window || this.window.isDestroyed()) return;
    this.applyAlwaysOnTop(nextSettings.alwaysOnTop);
    this.applyLock(nextSettings.locked);
    this.sendSettingsToWindow(nextSettings);
  }

  applyAlwaysOnTop(alwaysOnTop) {
    if (!this.window || this.window.isDestroyed()) return;
    const level = isMac ? 'screen-saver' : 'floating';
    try {
      this.window.setAlwaysOnTop(Boolean(alwaysOnTop), level);
      this.window.setVisibleOnAllWorkspaces(Boolean(alwaysOnTop), {
        visibleOnFullScreen: true,
      });
    } catch (error) {
      console.warn(
        '[desktopLyrics] always-on-top is not fully supported',
        error
      );
    }
  }

  applyLock(locked) {
    if (!this.window || this.window.isDestroyed()) return;
    try {
      // Linux window managers vary in how they handle transparent click-through.
      // Electron exposes the same API, so keep the call guarded and degrade to
      // "not draggable" if a platform rejects it.
      this.window.setIgnoreMouseEvents(Boolean(locked), {
        forward: !isLinux,
      });
    } catch (error) {
      console.warn(
        '[desktopLyrics] click-through is not fully supported',
        error
      );
    }
    this.sendSettingsToWindow();
  }

  persistBoundsSoon() {
    clearTimeout(this.resizeSaveTimer);
    this.resizeSaveTimer = setTimeout(() => {
      if (!this.window || this.window.isDestroyed()) return;
      this.persistSettings(this.window.getBounds());
    }, 250);
  }

  persistSettings(patch) {
    const currentSettings = this.store.get('settings') || {};
    const desktopLyrics = updateDesktopLyricsSettings(
      currentSettings.desktopLyrics,
      patch
    );
    const nextSettings = {
      ...currentSettings,
      desktopLyrics,
    };
    this.store.set('settings', nextSettings);
    if (Object.prototype.hasOwnProperty.call(patch, 'locked')) {
      this.applyLock(desktopLyrics.locked);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'alwaysOnTop')) {
      this.applyAlwaysOnTop(desktopLyrics.alwaysOnTop);
    }
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(
        'desktop-lyrics:settings-updated',
        desktopLyrics
      );
    }
    this.sendSettingsToWindow(desktopLyrics);
  }

  sendSettingsToWindow(settings = this.settings) {
    if (!this.window || this.window.isDestroyed()) return;
    const appSettings = this.store.get('settings') || {};
    this.window.webContents.send('desktop-lyrics:settings', {
      ...normalizeDesktopLyricsSettings(settings),
      lang: settings.lang || appSettings.lang || 'en',
    });
  }

  sendStateToWindow() {
    if (!this.window || this.window.isDestroyed()) return;
    this.window.webContents.send('desktop-lyrics:state', this.lastState);
  }

  updateState(state) {
    this.lastState = {
      ...DEFAULT_STATE,
      ...state,
    };
    this.sendStateToWindow();
  }

  openContextMenu() {
    const settings = this.settings;
    const labels = this.getLabels(settings.lang);
    const template = [
      {
        label: settings.visible ? labels.hide : labels.show,
        click: () => this.toggle(),
      },
      {
        label: settings.locked ? labels.unlock : labels.lock,
        click: () => this.persistSettings({ locked: !settings.locked }),
      },
      { type: 'separator' },
      {
        label: labels.settings || 'Settings',
        click: () => this.openSettings(),
      },
    ];
    Menu.buildFromTemplate(template).popup({ window: this.window });
  }

  getLabels(lang) {
    const labels = {
      en: {
        show: 'Show Desktop Lyrics',
        hide: 'Hide Desktop Lyrics',
        lock: 'Lock Desktop Lyrics',
        unlock: 'Unlock Desktop Lyrics',
        increaseFont: 'Increase Font Size',
        decreaseFont: 'Decrease Font Size',
        reset: 'Reset Style',
        settings: 'Settings',
      },
      'zh-CN': {
        show: '显示桌面歌词',
        hide: '隐藏桌面歌词',
        lock: '锁定桌面歌词',
        unlock: '解锁桌面歌词',
        increaseFont: '增大字体',
        decreaseFont: '减小字体',
        reset: '恢复默认样式',
      },
      'zh-TW': {
        show: '顯示桌面歌詞',
        hide: '隱藏桌面歌詞',
        lock: '鎖定桌面歌詞',
        unlock: '解鎖桌面歌詞',
        increaseFont: '增大字體',
        decreaseFont: '減小字體',
        reset: '恢復預設樣式',
      },
      tr: {
        show: 'Masaüstü sözlerini göster',
        hide: 'Masaüstü sözlerini gizle',
        lock: 'Masaüstü sözlerini kilitle',
        unlock: 'Masaüstü sözlerinin kilidini aç',
        increaseFont: 'Yazı boyutunu büyüt',
        decreaseFont: 'Yazı boyutunu küçült',
        reset: 'Varsayılan stile dön',
      },
    };
    return labels[lang] || labels.en;
  }

  sendPlayerCommand(channel, ...args) {
    if (
      this.mainWindow &&
      !this.mainWindow.isDestroyed() &&
      this.mainWindow.webContents
    ) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  openSettings() {
    if (
      this.mainWindow &&
      !this.mainWindow.isDestroyed() &&
      this.mainWindow.webContents
    ) {
      this.mainWindow.show();
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
      this.mainWindow.webContents.send('changeRouteTo', '/settings');
    }
  }

  register(channel, listener) {
    ipcMain.on(channel, listener);
    this.ipcHandlers.push([channel, listener]);
  }

  registerIpc() {
    this.register('desktop-lyrics:show', () => this.show());
    this.register('desktop-lyrics:hide', () => this.hide());
    this.register('desktop-lyrics:toggle', () => this.toggle());
    this.register('desktop-lyrics:state', (_, state) =>
      this.updateState(state)
    );
    this.register('desktop-lyrics:renderer-ready', () => {
      this.sendSettingsToWindow();
      this.sendStateToWindow();
    });
    this.register('desktop-lyrics:set-locked', (_, locked) => {
      this.persistSettings({ locked });
    });
    this.register('desktop-lyrics:set-interactive', (_, interactive) => {
      if (this.settings.locked && this.window && !this.window.isDestroyed()) {
        this.window.setIgnoreMouseEvents(!interactive, {
          forward: !isLinux,
        });
      }
    });
    this.register('desktop-lyrics:player-control', (_, command) => {
      const commandMap = {
        previous: 'previous',
        play: 'play',
        next: 'next',
        decreaseVolume: 'decreaseVolume',
        increaseVolume: 'increaseVolume',
      };
      if (commandMap[command]) {
        this.sendPlayerCommand(commandMap[command]);
      }
    });
    this.register('desktop-lyrics:set-volume', (_, volume) => {
      this.sendPlayerCommand('setVolume', volume);
    });
    this.register('desktop-lyrics:open-settings', () => this.openSettings());
  }

  destroy() {
    this.isQuitting = true;
    clearTimeout(this.resizeSaveTimer);
    this.ipcHandlers.forEach(([channel, listener]) => {
      ipcMain.removeListener(channel, listener);
    });
    this.ipcHandlers = [];
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
    }
  }
}

export function createDesktopLyricsManager(mainWindow, store) {
  return new DesktopLyricsManager(mainWindow, store);
}
