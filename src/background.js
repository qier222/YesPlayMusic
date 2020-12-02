"use strict";
import { app, protocol, BrowserWindow, shell, dialog } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { startNeteaseMusicApi } from "./electron/services";
import { initIpcMain } from "./electron/ipcMain.js";
import { createMenu } from "./electron/menu";
import { createTouchBar } from "./electron/touchBar";
import { createDockMenu } from "./electron/dockMenu";
import { createTray } from "./electron/tray.js";
import { autoUpdater } from "electron-updater";
import express from "express";
import expressProxy from "express-http-proxy";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
// eslint-disable-next-line no-unused-vars
let tray;

let willQuitApp = false;

// ipcMain
initIpcMain(win);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 840,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  });
  win.setMenuBarVisibility(false);

  if (process.platform !== "darwin") {
    tray = createTray(win);
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // win.loadURL("app://./index.html");
    const expressApp = express();
    expressApp.use("/", express.static(__dirname + "/"));
    expressApp.use("/api", expressProxy("http://127.0.0.1:10754"));
    expressApp.listen(27232);
    win.loadURL("http://localhost:27232");
  }

  win.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
  win.on("close", (e) => {
    if (willQuitApp) {
      /* the user tried to quit the app */
      win = null;
    } else {
      /* the user only tried to close the window */
      e.preventDefault();
      win.hide();
    }
  });
  // win.on("closed", () => {
  //   win = null;
  // });
  return win;
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    // app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  } else {
    win.show();
  }
});

/**
 * 'before-quit' is emitted when Electron receives the signal to exit and wants to start closing windows
 */
app.on("before-quit", () => (willQuitApp = true));

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // start netease music api
  startNeteaseMusicApi();

  // check for update
  const log = require("electron-log");
  log.transports.file.level = "debug";
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();

  if (process.platform === "darwin") {
    autoUpdater.on("update-available", (info) => {
      log.debug(info);
      dialog
        .showMessageBox({
          title: "发现新版本 v" + info.version,
          message: "发现新版本 v" + info.version,
          detail: "是否前往 Github 下载新版本安装包？",
          buttons: ["下载", "取消"],
          type: "question",
          noLink: true,
        })
        .then((result) => {
          if (result.response === 0) {
            shell.openExternal(
              "https://github.com/qier222/YesPlayMusic/releases"
            );
          }
        });
    });
  }

  // Install Vue Devtools extension
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  // create window
  createWindow();
  win.once("ready-to-show", () => {
    win.show();
  });

  // create menu
  createMenu(win);

  // create dock menu for macOS
  app.dock.setMenu(createDockMenu(win));

  // create touchbar
  win.setTouchBar(createTouchBar(win));
});

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
