import { app, ipcMain } from "electron";
import match from "@njzy/unblockneteasemusic";

export function initIpcMain(win) {
  // Make vuex copy for electron.
  global.vuexCopy = null;
  // 同步 vuex 状态，由于 player 有循环引用问题，拷贝部分属性
  ipcMain.on("vuex-state", (e, state) => {
    global.vuexCopy = state;
  });

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
    win.close();
    app.quit();
  });

  ipcMain.on("minimize", () => {
    win.minimize();
  });
}
