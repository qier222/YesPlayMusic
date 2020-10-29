"use strict";

const { app, ipcMain, Menu, MenuItem, BrowserWindow, globalShortcut } = require('electron')

let loginWindow, senders, win

function openWindow(url) {
  win = new BrowserWindow({
    height: 500,
    width: 350,
    useContentSize: true,
    transparent: false,
    frame: false,
    darkTheme: true,
    backgroundColor: "#FFF",
  });

  win.loadURL(url);

  win.on("closed", () => {
    loginWindow = null;
  });

  return win;
}

const menu = new Menu();

const settingsMenu = {
  playMenu: function () {
    const settings = {
      paly: {
        label: "播放",
        click: function () {
          senders.send("play-start");
        },
      },
      addPlayList: {
        label: "添加到播放列表",
        click: function () {
          senders.send("add-play-list");
        },
      },
      collect: {
        label: "收藏",
        submenu: [
          {
            label: "创建新歌单",
            click: function () {
              senders.send("i-like-star");
            },
          },
        ],
      },
      share: {
        label: "分享",
      },
      copyLink: {
        label: "复制链接",
      },
    };
    menu.append(new MenuItem(settings.paly));
    menu.append(new MenuItem(settings.addPlayList));
    menu.append(new MenuItem({ type: "separator" }));
    menu.append(new MenuItem(settings.collect));
    menu.append(new MenuItem(settings.share));
    menu.append(new MenuItem(settings.copyLink));
  },
};

function command(mainWindow, winURL) {
  // 显示播放菜单
  settingsMenu.playMenu();
  // 接收显示菜单指令
  ipcMain.on("show-content-menu", (event) => {
    senders = event.sender;
    const win = BrowserWindow.fromWebContents(senders);
    menu.popup(win);
  });
  // 设置app名称
  app.setName("网易云音乐App");
  // 关闭window窗口
  ipcMain.on("window-close", (event) => {
    app.quit();
  });
  // 最大化window窗口
  ipcMain.on("window-max", (event) => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  // 最小化window窗口
  ipcMain.on("window-min", (event) => {
    if (!mainWindow.isMinimized()) {
      mainWindow.minimize();
    }
  });
  // 新建登录窗口
  ipcMain.on("open-login-window", (event, url) => {
    if (loginWindow) {
      loginWindow.focus();
    } else {
      loginWindow = openWindow(url);
    }
  });
  // 关闭登录窗口
  ipcMain.on("close-login-window", (event) => {
    loginWindow.close();
  });
  // 触发调试 Shift+i
  globalShortcut.register("Shift+i", () => {
    require("electron-debug")({ showDevTools: true });
  });
}

app.on("ready", async () => {
  openWindow();
  command(win)
});
