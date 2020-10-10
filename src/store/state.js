import { Howler } from "howler";

export default {
  Howler: Howler,
  howler: null,
  contextMenu: {
    clickObjectID: 0,
    showMenu: false,
  },
  player: JSON.parse(localStorage.getItem("player")),
  settings: JSON.parse(localStorage.getItem("settings")),
};
