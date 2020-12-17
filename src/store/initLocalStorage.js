import { playlistCategories } from "@/utils/staticData";

let localStorage = {
  player: {
    enable: false,
    show: true,
    playing: false,
    shuffle: false,
    volume: 1,
    repeat: "off", // on | off | one
    currentTrack: {},
    notShuffledList: [],
    list: [],
    listInfo: {
      type: "",
      id: "",
    },
  },
  settings: {
    playlistCategories,
    lang: null,
    appearance: "auto",
    musicQuality: 320000,
    showGithubIcon: true,
    showPlaylistsByAppleMusic: true,
    showUnavailableSongInGreyStyle: true,
    automaticallyCacheSongs: false,
    nyancatStyle: false,
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
}

export default localStorage;
