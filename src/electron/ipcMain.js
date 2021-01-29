import { app, ipcMain } from "electron";
import match from "@njzy/unblockneteasemusic";

export function initIpcMain(win, store) {
  ipcMain.on("unblock-music", (event, track) => {
    // 兼容 unblockneteasemusic 所使用的 api 字段
    track.alias = track.alia || [];
    track.duration = track.dt || 0;
    track.album = track.al || [];
    track.artists = track.ar || [];

    const matchPromise = match(track.id, ["qq", "kuwo", "migu"], track);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject("timeout");
      }, 3000);
    });
    Promise.race([matchPromise, timeoutPromise])
      .then((res) => {
        event.returnValue = res;
      })
      .catch((err) => {
        console.log("unblock music error: ", err);
        event.returnValue = null;
      });
  });

  ipcMain.on("close", () => {
    win.hide();
    // win.close();
    // app.quit();
  });

  ipcMain.on("minimize", () => {
    win.minimize();
  });

  ipcMain.on("settings", (event, options) => {
    store.set("settings", options);
  });
}
