import { app, ipcMain, dialog } from "electron";
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

  ipcMain.on("close", (e) => {
    if (process.platform == "darwin") {
      win.hide();
    }
    e.preventDefault(); //阻止默认行为
    dialog
      .showMessageBox({
        type: "info",
        title: "Information",
        cancelId: 2,
        defaultId: 0,
        message: "确定要关闭吗？",
        buttons: ["最小化", "直接退出"],
      })
      .then((result) => {
        if (result.response == 0) {
          e.preventDefault(); //阻止默认行为
          win.minimize(); //调用 最小化实例方法
        } else if (result.response == 1) {
          win = null;
          //app.quit();
          app.exit(); //exit()直接关闭客户端，不会执行quit();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  ipcMain.on("minimize", () => {
    win.minimize();
  });

  ipcMain.on("settings", (event, options) => {
    store.set("settings", options);
  });
}
