import { playlistCategories } from "@/utils/staticData";

export default {
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
  },
  data: {
    user: {},
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: null,
  },
};
