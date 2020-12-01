import { app, ipcMain } from "electron";
import match from "@nondanee/unblockneteasemusic";

export function initIpcMain(win) {
  // Make vuex copy for electron.
  global.vuexCopy = null;
  // 同步 vuex 状态，由于 player 有循环引用问题，拷贝部分属性
  ipcMain.on("vuex-state", (e, state) => {
    global.vuexCopy = state;
  });

  ipcMain.on("unblock-music", (event, id) => {
    match(id, ["qq", "kuwo", "migu"]).then((res) => {
      event.returnValue = res;
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
