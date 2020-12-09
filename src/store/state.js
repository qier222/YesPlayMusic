export default {
  howler: null,
  liked: {
    songs: [],
  },
  contextMenu: {
    clickObjectID: 0,
    showMenu: false,
  },
  toast: {
    show: false,
    text: "",
    timer: null,
  },
  player: JSON.parse(localStorage.getItem("player")),
  settings: JSON.parse(localStorage.getItem("settings")),
  data: JSON.parse(localStorage.getItem("data")),
};
