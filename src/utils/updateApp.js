import pack from "../../package.json";

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

export default function () {
  while (localStorage.getItem("appVersion") !== pack.version) {
    let currentVersion = localStorage.getItem("appVersion");
    if (currentVersion === "0.1") {
      updateTo_0_2_0();
    }
  }
}
