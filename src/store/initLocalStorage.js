import { playlistCategories } from "@/utils/staticData";

export default {
  player: {
    enable: false,
    show: true,
    playing: false,
    shuffle: false,
    volume: 1,
    repeat: "off", // on | off | one
    currentTrack: {
      sort: 0,
      name: "Happiness",
      id: 1478005597,
      artists: [{ id: 12931567, name: "John K", tns: [], alias: [] }],
      album: {
        id: 95187944,
        name: "Happiness",
        picUrl:
          "https://p1.music.126.net/kHNNN-VxufjlBtyNPIP3kg==/109951165306614548.jpg",
        tns: [],
        pic_str: "109951165306614548",
        pic: 109951165306614540,
      },
      time: 196022,
      playable: true,
    },
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
  },
  data: {
    user: {},
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: null,
  },
};
