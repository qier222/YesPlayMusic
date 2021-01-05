import initLocalStorage from "./initLocalStorage";
import pkg from "../../package.json";

if (localStorage.getItem("appVersion") === null) {
  localStorage.setItem("settings", JSON.stringify(initLocalStorage.settings));
  localStorage.setItem("data", JSON.stringify(initLocalStorage.data));
  localStorage.setItem("appVersion", pkg.version);
}

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
  modals: {
    addTrackToPlaylistModal: {
      show: false,
      selectedTrackID: 0,
    },
    newPlaylistModal: {
      show: false,
      afterCreateAddTrackID: 0,
    },
  },
  player: JSON.parse(localStorage.getItem("player")),
  settings: JSON.parse(localStorage.getItem("settings")),
  data: JSON.parse(localStorage.getItem("data")),
};
