import pack from "../../package.json";
import initLocalStorage from "@/store/initLocalStorage.js";

// function exampleFunction() {
//   console.log("update to vx.x.x");
//   // 0.2.0 to 0.2.1
//   localStorage.setItem("appVersion", "x.x.x");
//   window.location.reload();
// }

function updateTo_0_2_0() {
  // 0.1 to 0.2.0
  // 移动 settings 内的 user 数据到 data
  let settings = JSON.parse(localStorage.getItem("settings"));
  let data = {
    likedSongPlaylistID: settings.user.likedSongPlaylistID,
    lastRefreshCookieDate: settings.lastRefreshCookieDate,
  };
  delete settings.user.likedSongPlaylistID;
  delete settings.lastRefreshCookieDate;
  data.user = settings.user;
  delete settings.user;
  localStorage.setItem("settings", JSON.stringify(settings));
  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("appVersion", "0.2.0");
  window.location.reload();
}

function updateTo_0_2_1() {
  console.log("update to v0.2.1");
  // 0.2.0 to 0.2.1
  // 初始化 playlistCategories
  let settings = JSON.parse(localStorage.getItem("settings"));
  settings.playlistCategories = initLocalStorage.settings.playlistCategories;
  localStorage.setItem("settings", JSON.stringify(settings));
  localStorage.setItem("appVersion", "0.2.1");
  window.location.reload();
}

export default function () {
  while (localStorage.getItem("appVersion") !== pack.version) {
    let currentVersion = localStorage.getItem("appVersion");
    if (currentVersion === "0.1") {
      updateTo_0_2_0();
    }
    if (currentVersion === "0.2.0") {
      updateTo_0_2_1();
    }
  }
}
