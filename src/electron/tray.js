/* global __static */
import path from 'path';
import { app, nativeImage, Tray, Menu, MenuItem } from 'electron';

export function createTray(win) {
  let icon = nativeImage
    .createFromPath(path.join(__static, 'img/icons/menu@88.png'))
    .resize({
      height: 20,
      width: 20,
    });

  let contextMenu = new Menu();
  let tray = new Tray(icon);
  tray.setToolTip('YesPlayMusic');

  if (process.platform === 'linux') {
    //linux下托盘的实现方式比较迷惑
    //right-click无法在linux下使用
    //click在默认行为下会弹出一个contextMenu，里面的唯一选项才会调用click事件
    //setContextMenu应该是目前唯一能在linux下使用托盘菜单api
    //但是无法区分鼠标左右键

    //setContextMenu破坏了预期的click行为
    //在linux下，最小化到托盘的行为貌似与最小化一致
    //所以此处添加一个显示主面板的按钮
    contextMenu.append([
      {
        label: '显示主面板',
        icon: nativeImage.createFromPath(
          path.join(__static, 'img/icons/menu.png')
        ),
        click: () => {
          win.show();
        },
      },
      {
        type: 'separator',
      },
    ]);
    appendCommonTrayContextItems(win, contextMenu);
    tray.setContextMenu(contextMenu);
  } else {
    //windows and macos
    appendCommonTrayContextItems(win, contextMenu);

    tray.on('click', () => {
      win.show();
    });

    tray.on('right-click', () => {
      tray.popUpContextMenu(contextMenu);
    });
  }

  return tray;
}

function appendCommonTrayContextItems(win, contextMenu) {
  contextMenu.append([
    {
      label: '播放/暂停',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/play.png')
      ),
      click: () => {
        win.webContents.send('play');
      },
    },
    {
      label: '上一首',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/left.png')
      ),
      accelerator: 'CmdOrCtrl+Left',
      click: () => {
        win.webContents.send('previous');
      },
    },
    {
      label: '下一首',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/right.png')
      ),
      accelerator: 'CmdOrCtrl+Right',
      click: () => {
        win.webContents.send('next');
      },
    },
    {
      label: '循环播放',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/repeat.png')
      ),
      accelerator: 'Alt+R',
      click: () => {
        win.webContents.send('repeat');
      },
    },
    {
      label: '加入喜欢',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/like.png')
      ),
      accelerator: 'CmdOrCtrl+L',
      click: () => {
        win.webContents.send('like');
      },
    },
    {
      label: '退出',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/exit.png')
      ),
      accelerator: 'CmdOrCtrl+W',
      click: () => {
        app.exit();
      },
    },
  ]);
}
