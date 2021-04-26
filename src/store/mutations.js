import { disableScrolling, enableScrolling } from '@/utils/ui';

export default {
  updateLikedXXX(state, { name, data }) {
    state.liked[name] = data;
    if (name === 'songs') {
      state.player.sendSelfToIpcMain();
    }
  },
  changeLang(state, lang) {
    state.settings.lang = lang;
  },
  changeMusicQuality(state, value) {
    state.settings.musicQuality = value;
  },
  changeLyricFontSize(state, value) {
    state.settings.lyricFontSize = value;
  },
  changeOutputDevice(state, deviceId) {
    state.settings.outputDevice = deviceId;
  },
  updateSettings(state, { key, value }) {
    state.settings[key] = value;
  },
  updateData(state, { key, value }) {
    state.data[key] = value;
  },
  togglePlaylistCategory(state, name) {
    const index = state.settings.enabledPlaylistCategories.findIndex(
      c => c === name
    );
    if (index !== -1) {
      state.settings.enabledPlaylistCategories = state.settings.enabledPlaylistCategories.filter(
        c => c !== name
      );
    } else {
      state.settings.enabledPlaylistCategories.push(name);
    }
  },
  updateToast(state, toast) {
    state.toast = toast;
  },
  updateModal(state, { modalName, key, value }) {
    state.modals[modalName][key] = value;
    if (key === 'show') {
      // 100ms的延迟是为等待右键菜单blur之后再disableScrolling
      value === true
        ? setTimeout(() => disableScrolling(), 100)
        : enableScrolling();
    }
  },
  toggleLyrics(state) {
    state.showLyrics = !state.showLyrics;
  },
  updateDailyTracks(state, dailyTracks) {
    state.dailyTracks = dailyTracks;
  },
  updateLastfm(state, session) {
    state.lastfm = session;
  },
};
