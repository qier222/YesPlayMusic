import { ipcRenderer, nativeImage, ipcMain } from 'electron';

// ********************************************
// *************** utils **********************
// ********************************************

// 复用 macos touchbar 的 icon
function getNativeIcon(name) {
  const path = require('path');
  return nativeImage.createFromPath(
    // eslint-disable-next-line no-undef
    path.join(__static, 'img/touchbar/', name)
  );
}

// *************** utils end ******************

// ********************************************
// ************* taskbar progress *************
// ********************************************

const NO_PROGRESS = -1;

function taskbarProgress(vueInstance) {
  const self = vueInstance;

  // 本 js 文件，renderer 和 main 共用，不能在这里 import @/store
  const store = self.$store;

  const player = store.state.player;

  // 进度条计算
  const getProgressStatus = () => {
    const { progress, currentTrackDuration, playing } = player;
    const ratio = progress / currentTrackDuration || NO_PROGRESS;
    return {
      progress: ratio,
      playing: playing,
    };
  };

  const unwatch = {};

  const registerUnregister = () => {
    console.log(
      'Windows taskbar progress registerUnregister watch handle. Enable: %o',
      store.state.settings.enableWindowsTaskbarProgress
    );
    if (
      store.state.settings.enableWindowsTaskbarProgress &&
      !unwatch.progress &&
      !unwatch.playing
    ) {
      unwatch.progress = self.$watch(
        () => player.progress,
        () => {
          const status = getProgressStatus();
          ipcRenderer.send('setTaskbarProgress', JSON.stringify(status));
        }
      );

      // 对播放状态的监听，按照常见应用，应当变更为黄色，播放时为绿色并继续
      // 具体状态决策，在 ipcMain 中
      unwatch.playing = self.$watch(
        () => player.playing,
        () => {
          const status = getProgressStatus();
          ipcRenderer.send('setTaskbarProgress', JSON.stringify(status));
        }
      );
      // 初始化
      const status = getProgressStatus();
      ipcRenderer.send('setTaskbarProgress', JSON.stringify(status));
    } else {
      // 发送 无进度条 指令，清除进度条
      ipcRenderer.send(
        'setTaskbarProgress',
        JSON.stringify({
          progress: NO_PROGRESS,
          playing: false,
        })
      );
      unwatch.progress && unwatch.progress();
      unwatch.progress = null;
      unwatch.playing && unwatch.playing();
      unwatch.playing = null;
    }
  };

  // 监听设置的开关状态
  self.$watch(
    () => store.state.settings.enableWindowsTaskbarProgress,
    () => {
      registerUnregister();
    }
  );

  // 初始化
  registerUnregister();
}

// ************* taskbar progress end *************

// ********************************************
// ************* thumbnail clip ***************
// ********************************************

// ************* thumbnail clip end ***********

// ********************************************
// ************* taskbar button ***************
// ********************************************

function taskbarButton(window) {
  const renderer = window.webContents;

  const playButton = {
    click: () => {
      renderer.send('play');
    },
    icon: getNativeIcon('play.png'),
  };

  const previousTrackButton = {
    click: () => {
      renderer.send('previous');
    },
    icon: getNativeIcon('backward.png'),
  };

  const nextTrackButton = {
    click: () => {
      renderer.send('next');
    },
    icon: getNativeIcon('forward.png'),
  };

  const likeButton = {
    click: () => {
      renderer.send('like');
    },
    icon: getNativeIcon('like.png'),
  };

  const param = [likeButton, previousTrackButton, playButton, nextTrackButton];

  ipcMain.on('player', (e, { playing, likedCurrentTrack }) => {
    playButton.icon =
      playing === true ? getNativeIcon('pause.png') : getNativeIcon('play.png');
    likeButton.icon = likedCurrentTrack
      ? getNativeIcon('like_fill.png')
      : getNativeIcon('like.png');
    window.setThumbarButtons(param);
  });

  // 设置初始值
  window.setThumbarButtons(param);
}

// ************* taskbar button end ***********

// ************* export ***********************

export function taskBarForRenderer(vueInstance) {
  taskbarProgress(vueInstance);
}

export function taskBarForMain(window) {
  window.once('ready-to-show', () => {
    taskbarButton(window);
  });
}
