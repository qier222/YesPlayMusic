export default {
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
  player: JSON.parse(localStorage.getItem("player")),
  settings: JSON.parse(localStorage.getItem("settings")),
};
