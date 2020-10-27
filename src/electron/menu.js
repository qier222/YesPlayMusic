const { Menu, app } = require("electron");

const version = app.getVersion();

let win;
let updateSource = "menu"; // 更新事件触发来源  menu:通过菜单触发 vue:通过vue页面触发
let template = [
  {
    label: "编辑",
    submenu: [
      {
        label: "剪切",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "CmdOrCtrl+X";
          } else {
            return "Ctrl+X";
          }
        })(),
        role: "cut",
      },
      {
        label: "复制",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "CmdOrCtrl+C";
          } else {
            return "Ctrl+C";
          }
        })(),
        role: "copy",
      },
      {
        label: "粘贴",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "CmdOrCtrl+V";
          } else {
            return "Ctrl+V";
          }
        })(),
        role: "paste",
      },
    ],
  },
  {
    label: "工具",
    submenu: [
      {
        label: "刷新",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "CmdOrCtrl+R";
          } else {
            return "F5";
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        label: "全屏",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Ctrl+Command+F";
          } else {
            return "F11";
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      },
      {
        label: "检查",
        accelerator: "F12",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        },
      },
    ],
  },
];

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  let reopenMenuItem;
  menu.items.forEach((item) => {
    if (item.submenu) {
      item.submenu.items.forEach((item) => {
        if (item.key === "reopenMenuItem") {
          reopenMenuItem = item;
        }
      });
    }
  });
  return reopenMenuItem;
}

// mac 添加退出
if (process.platform === "darwin") {
  const name = app.getName();
  template.unshift({
    label: name + " v" + version,
    submenu: [
      {
        label: "退出",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  });
}
// win 添加更新菜单
if (process.platform === "win32") {
  template.push({
    label: "帮助",
    submenu: [
      {
        label: `当前版本 v${version}`,
        enabled: false,
      },
      {
        label: "检查更新",
        accelerator: "Ctrl+U",
        click: (item, focusedWindow) => {
          // 执行自动更新检查
          win = focusedWindow;
          updateSource = "menu";
          autoUpdater.checkForUpdates();
        },
      },
    ],
  });
}

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})
