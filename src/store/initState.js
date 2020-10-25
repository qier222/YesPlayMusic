const initState = {
  howler: null,
  accountLogin: false,
  usernameLogin: false,
  liked: {
    songs: [],
  },
  contextMenu: {
    clickObjectID: 0,
    showMenu: false,
  },
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
    playlistCategories: [
      {
        name: "全部",
        enable: true,
      },
      {
        name: "推荐歌单",
        enable: true,
      },
      {
        name: "精品歌单",
        enable: true,
      },
      {
        name: "官方",
        enable: true,
      },
      {
        name: "流行",
        enable: true,
      },
      {
        name: "电子",
        enable: true,
      },
      {
        name: "摇滚",
        enable: true,
      },
      {
        name: "ACG",
        enable: true,
      },
      // {
      //   name: "最新专辑",
      //   enable: true,
      // },
      {
        name: "排行榜",
        enable: true,
      },
    ],
    user: {
      id: 0,
    },
    lang: null,
    appearance: "auto",
    musicQuality: 320000,
    showGithubIcon: true,
    showPlaylistsByAppleMusic: true,
    lastRefreshCookieDate: 0,
  },
};

export default initState;
