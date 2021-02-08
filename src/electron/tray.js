/* global __static */
import path from "path";
import { app, nativeImage, Tray, Menu } from "electron";

export function createTray(win) {
  let icon = nativeImage
    .createFromPath(path.join(__static, "img/icons/menu@88.png"))
    .resize({
      height: 20,
      width: 20,
    });
  let tray = new Tray(icon);

  tray.setToolTip("YesPlayMusic");

  tray.on("click", () => {
    win.show();
    tray.destroy();
  });

  tray.on("right-click", () => {
    const contextMenu = Menu.buildFromTemplate([
      {
          label: "播放/暂停",
          icon:  "src/icon/play.png",
          click: () => {
            win.webContents.send("play");
          },
        },
        {
          label: "上一首",
          icon:  "src/icon/left.png",
          accelerator: "CmdOrCtrl+Left",
          click: () => {
            win.webContents.send("previous");
          },
        },
        {
          label: "下一首",
          icon:  "src/icon/right.png",
          accelerator: "CmdOrCtrl+Right",
          click: () => {
            win.webContents.send("next");
          },
        },
        {
          label: "循环播放",
          icon:  "src/icon/repeat.png",
          accelerator: "Alt+R",
          click: () => {
            win.webContents.send("repeat");
          },
        },
        {
          label: "加入喜欢",
          icon:  "src/icon/like.png",
          accelerator: "CmdOrCtrl+L",
          click: () => {
            win.webContents.send("like");
          },
        },
        {
          label: "退出",
          icon:  "src/icon/exit.png",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            app.exit();
          },
        },
    ]);
    
    tray.popUpContextMenu(contextMenu);
  });

  return tray;
