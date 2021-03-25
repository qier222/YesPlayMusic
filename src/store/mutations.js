export default {
  updateLikedSongs(state, trackIDs) {
    state.liked.songs = trackIDs;
    state.player.sendSelfToIpcMain();
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
    let cat = state.settings.playlistCategories.find((c) => c.name === name);
    cat.enable = !cat.enable;
    state.settings.playlistCategories = state.settings.playlistCategories.map(
      (c) => {
        if (c.name === name) {
          return cat;
        }
        return c;
      }
    );
  },
  updateToast(state, toast) {
    state.toast = toast;
  },
  updateModal(state, { modalName, key, value }) {
    state.modals[modalName][key] = value;
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
