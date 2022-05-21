/* global __static */
import path from 'path';
import { BrowserWindow, nativeImage, ipcMain, ThumbarButton } from 'electron';

/**
 * @param {string} filename
 */
function createNativeImage(filename) {
  return nativeImage.createFromPath(
    path.join(__static, `img/taskbar/${filename}`)
  );
}

/**
 * @param {BrowserWindow} win
 */
function createThumbarButtons(win) {
  /**
   * @type {Map<string, ThumbarButton>} map
   */
  const map = new Map()
    .set('play', {
      icon: createNativeImage('play.png'),
      tooltip: '播放',
      click: () => {
        win.webContents.send('play');
      },
    })
    .set('pause', {
      icon: createNativeImage('pause.png'),
      tooltip: '暂停',
      click: () => {
        win.webContents.send('play');
      },
    })
    .set('previous', {
      icon: createNativeImage('previous.png'),
      tooltip: '上一首',
      click: () => {
        win.webContents.send('previous');
      },
    })
    .set('next', {
      icon: createNativeImage('next.png'),
      tooltip: '下一首',
      click: () => {
        win.webContents.send('next');
      },
    });
  return map;
}

class YPMTaskbarImpl {
  constructor(win) {
    this.win = win;
    this.thumbarButtons = createThumbarButtons(win);
    this.playing = false;
    this.handleEvents();
  }

  updateThumbarButtons() {
    this.win.setThumbarButtons([
      this.thumbarButtons.get('previous'),
      this.thumbarButtons.get(this.playing ? 'pause' : 'play'),
      this.thumbarButtons.get('next'),
    ]);
  }

  handleEvents() {
    ipcMain.on('initTaskbar', (_, enabled) => {
      if (enabled) this.updateThumbarButtons();
    });

    ipcMain.on('player', (_, { playing }) => {
      if (playing !== this.playing) {
        this.playing = playing;
        this.updateThumbarButtons();
      }
    });
  }
}

/**
 * @param {BrowserWindow} win
 */
export function createTaskbar(win) {
  return new YPMTaskbarImpl(win);
}
