import store from '@/store';
import * as cast from '@/utils/cast';
import { castState } from '@/utils/cast';

const player = store.state.player;

// Menu items, MPRIS (Linux) and the registered media keys all land here. While
// a device is selected the raw `player` methods only move the muted local
// <audio>, so route the transport ones onto the device instead — otherwise
// "pause" stops the silent local element and the speaker keeps playing.
// Synchronous gate: `deviceTransport` is async, so `controlsDevice()` decides
// whether this command belongs to the device or to the local element.
const onDevice = () => cast.controlsDevice();

export function ipcRenderer(vueInstance) {
  const self = vueInstance;
  // 添加专有的类名
  document.body.setAttribute('data-electron', 'yes');
  document.body.setAttribute(
    'data-electron-os',
    window.require('os').platform()
  );
  // ipc message channel
  const electron = window.require('electron');
  const ipcRenderer = electron.ipcRenderer;

  // listens to the main process 'changeRouteTo' event and changes the route from
  // inside this Vue instance, according to what path the main process requires.
  // responds to Menu click() events at the main process and changes the route accordingly.

  ipcRenderer.on('changeRouteTo', (event, path) => {
    self.$router.push(path);
    if (store.state.showLyrics) {
      store.commit('toggleLyrics');
    }
  });

  ipcRenderer.on('search', () => {
    // 触发数据响应
    self.$refs.navbar.$refs.searchInput.focus();
    self.$refs.navbar.inputFocus = true;
  });

  ipcRenderer.on('play', () => {
    if (onDevice()) {
      const wasPlaying = !!castState.active[cast.activeId()];
      cast.deviceTransport('toggle', player.currentTrack).catch(() => {});
      // Keep the muted conductor in lockstep so the queue keeps advancing.
      if (wasPlaying) {
        if (player.pause) player.pause();
      } else if (player.play) {
        player.play();
      }
      return;
    }
    player.playOrPause();
  });

  ipcRenderer.on('next', () => {
    if (player.isPersonalFM) {
      player.playNextFMTrack();
    } else {
      player.playNextTrack();
    }
  });

  ipcRenderer.on('previous', () => {
    player.playPrevTrack();
  });

  ipcRenderer.on('increaseVolume', () => {
    if (onDevice()) {
      cast.nudgeDeviceVolume(0.1);
      return;
    }
    if (player.volume + 0.1 >= 1) {
      return (player.volume = 1);
    }
    player.volume += 0.1;
  });

  ipcRenderer.on('decreaseVolume', () => {
    if (onDevice()) {
      cast.nudgeDeviceVolume(-0.1);
      return;
    }
    if (player.volume - 0.1 <= 0) {
      return (player.volume = 0);
    }
    player.volume -= 0.1;
  });

  ipcRenderer.on('like', () => {
    store.dispatch('likeATrack', player.currentTrack.id);
  });

  ipcRenderer.on('repeat', () => {
    player.switchRepeatMode();
  });

  ipcRenderer.on('shuffle', () => {
    player.switchShuffle();
  });

  ipcRenderer.on('routerGo', (event, where) => {
    self.$refs.navbar.go(where);
  });

  ipcRenderer.on('nextUp', () => {
    self.$refs.player.goToNextTracksPage();
  });

  ipcRenderer.on('rememberCloseAppOption', (event, value) => {
    store.commit('updateSettings', {
      key: 'closeAppOption',
      value,
    });
  });

  ipcRenderer.on('setPosition', (event, position) => {
    player._howler.seek(position);
  });
}
