"use strict";
const path = require('path')
// import { autoUpdater } from "electron-updater"
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  globalShortcut 
} from "electron";

import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const isDevelopment = process.env.NODE_ENV !== "production";
const { createTouchBar } = require("./electron/touchbar");
const { createMenu } = require("./electron/menu");
const { setAppBounced } = require("./electron/bounced")
const { setIcon } = require("./electron/setIcon")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let touchbar

const iconString = path.join(__static, "img/icons/apple-touch-icon.png");

// Make vuex copy for electron.
global.vuexCopy = null
// 同步 vuex 状态，由于 player 有循环引用问题，拷贝部分属性
ipcMain.on('vuex-state', (e, state) => {
  global.vuexCopy = state
})
ipcMain.on("close", () => {
  win.close();
  app.quit(); 
});
ipcMain.on("minimize", () => {
  win.minimize();
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

setAppBounced(app)
setIcon(app, iconString)

function createWindow() {
  const tray = require("./electron/tray.js");
  win = new BrowserWindow({
    width: 1440,
    height: 768,
    icon: iconString,
    backgroundColor: '#2e2c29',
    titleBarStyle: "default",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
    preload: path.join(__dirname, "./electron/preload.js"),
  });

  tray.on("click", () => {
    if (win && win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
  return win
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // 启动 api 服务器
  require("./electron/services.js");
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  // Register shortcut for debug
  globalShortcut.register("CommandOrControl+K", function () {
    win.webContents.openDevTools();
  });
  createWindow();
  win.once("ready-to-show", () => {
    win.show()
  })
  createMenu(win);
  touchbar = createTouchBar(win)
  win.setTouchBar(touchbar);
  // autoUpdater.checkForUpdatesAndNotify()
});

// autoUpdater.on("checking-for-update", () => {});
// autoUpdater.on("update-available", info => {
//   console.log(info);
//   dialog.showMessageBox({
//     title: "新版本发布",
//     message: "有新内容更新，稍后将重新为您安装",
//     buttons: ["确定"],
//     type: "info",
//     noLink: true
//   });
// });

// autoUpdater.on("update-downloaded", info => {
//   console.log(info);
//   autoUpdater.quitAndInstall();
// });

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// Make sure the app is singleton.
function initialize() {
  const shouldQuit = !app.requestSingleInstanceLock();
  if (shouldQuit) return app.quit();
}

initialize();
