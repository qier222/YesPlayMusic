/* global __static */
import path from 'path';
import { app, nativeImage, Tray, Menu } from 'electron';
import { isLinux } from '@/utils/platform';

function createMenuTemplate(win) {
  return [
    {
      label: '播放',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/play.png')
      ),
      click: () => {
        win.webContents.send('play');
      },
      id: 'play',
    },
    {
      label: '暂停',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/pause.png')
      ),
      click: () => {
        win.webContents.send('play');
      },
      id: 'pause',
      visible: false,
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
      id: 'like',
    },
    {
      label: '取消喜欢',
      icon: nativeImage.createFromPath(
        path.join(__static, 'img/icons/unlike.png')
      ),
      accelerator: 'CmdOrCtrl+L',
      click: () => {
        win.webContents.send('like');
      },
      id: 'unlike',
      visible: false,
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
  ];
}

// linux下托盘的实现方式比较迷惑
// right-click无法在linux下使用
// click在默认行为下会弹出一个contextMenu，里面的唯一选项才会调用click事件
// setContextMenu应该是目前唯一能在linux下使用托盘菜单api
// 但是无法区分鼠标左右键

// 发现openSUSE KDE环境可以区分鼠标左右键
// 添加左键支持
// 2022.05.17
class YPMTrayLinuxImpl {
  constructor(tray, win, emitter) {
    this.tray = tray;
    this.win = win;
    this.emitter = emitter;
    this.template = undefined;
    this.initTemplate();
    this.contextMenu = Menu.buildFromTemplate(this.template);

    this.tray.setContextMenu(this.contextMenu);
    this.handleEvents();
  }

  initTemplate() {
    //在linux下，鼠标左右键都会呼出contextMenu
    //所以此处单独为linux添加一个 显示主面板 选项
    this.template = [
      {
        label: '显示主面板',
        click: () => {
          this.win.show();
        },
      },
      {
        type: 'separator',
      },
    ].concat(createMenuTemplate(this.win));
  }

  handleEvents() {
    this.tray.on('click', () => {
      this.win.show();
    });

    this.emitter.on('updateTooltip', title => this.tray.setToolTip(title));
    this.emitter.on('updatePlayState', isPlaying => {
      this.contextMenu.getMenuItemById('play').visible = !isPlaying;
      this.contextMenu.getMenuItemById('pause').visible = isPlaying;
      this.tray.setContextMenu(this.contextMenu);
    });
    this.emitter.on('updateLikeState', isLiked => {
      this.contextMenu.getMenuItemById('like').visible = !isLiked;
      this.contextMenu.getMenuItemById('unlike').visible = isLiked;
      this.tray.setContextMenu(this.contextMenu);
    });
  }
}

class YPMTrayWindowsImpl {
  constructor(tray, win, emitter) {
    this.tray = tray;
    this.win = win;
    this.emitter = emitter;
    this.template = createMenuTemplate(win);
    this.contextMenu = Menu.buildFromTemplate(this.template);

    this.isPlaying = false;
    this.curDisplayPlaying = false;

    this.isLiked = false;
    this.curDisplayLiked = false;

    this.handleEvents();
  }

  handleEvents() {
    this.tray.on('click', () => {
      this.win.show();
    });

    this.tray.on('right-click', () => {
      if (this.isPlaying !== this.curDisplayPlaying) {
        this.curDisplayPlaying = this.isPlaying;
        this.contextMenu.getMenuItemById('play').visible = !this.isPlaying;
        this.contextMenu.getMenuItemById('pause').visible = this.isPlaying;
      }

      if (this.isLiked !== this.curDisplayLiked) {
        this.curDisplayLiked = this.isLiked;
        this.contextMenu.getMenuItemById('like').visible = !this.isLiked;
        this.contextMenu.getMenuItemById('unlike').visible = this.isLiked;
      }

      this.tray.popUpContextMenu(this.contextMenu);
    });

    this.emitter.on('updateTooltip', title => this.tray.setToolTip(title));
    this.emitter.on(
      'updatePlayState',
      isPlaying => (this.isPlaying = isPlaying)
    );
    this.emitter.on('updateLikeState', isLiked => (this.isLiked = isLiked));
  }
}

export function createTray(win, eventEmitter) {
  let icon = nativeImage
    .createFromPath(path.join(__static, 'img/icons/menu@88.png'))
    .resize({
      height: 20,
      width: 20,
    });

  let tray = new Tray(icon);
  tray.setToolTip('YesPlayMusic');

  return isLinux
    ? new YPMTrayLinuxImpl(tray, win, eventEmitter)
    : new YPMTrayWindowsImpl(tray, win, eventEmitter);
}
