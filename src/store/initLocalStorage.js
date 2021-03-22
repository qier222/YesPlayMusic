import { playlistCategories } from "@/utils/staticData";

let localStorage = {
  player: {},
  settings: {
    playlistCategories,
    lang: null,
    appearance: "auto",
    musicQuality: 320000,
    lyricFontSize: 28,
    outputDevice: "default",
    showPlaylistsByAppleMusic: true,
    showUnavailableSongInGreyStyle: true,
    automaticallyCacheSongs: false,
    nyancatStyle: false,
    showLyricsTranslation: true,
    showLyricsDynamicBackground: false,
    minimizeToTray: false,
    enableDiscordRichPresence: false,
    enableGlobalShortcut: true,
  },
  data: {
    user: {},
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: null,
  },
};

if (process.env.IS_ELECTRON === true) {
  localStorage.settings.automaticallyCacheSongs = true;
  localStorage.settings.showUnavailableSongInGreyStyle = false;
}

export default localStorage;
