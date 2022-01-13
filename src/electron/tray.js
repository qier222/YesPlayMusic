/* global __static */
import path from 'path';
import { app, nativeImage, Tray, Menu, MenuItem } from 'electron';
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
  ];
}

// linux下托盘的实现方式比较迷惑
// right-click无法在linux下使用
// click在默认行为下会弹出一个contextMenu，里面的唯一选项才会调用click事件
// setContextMenu应该是目前唯一能在linux下使用托盘菜单api
// 但是无法区分鼠标左右键
class YPMTrayLinuxImpl {
  constructor(tray, win, emitter) {
    this.tray = tray;
    this.win = win;
    this.emitter = emitter;
    this.template = undefined;
    this.initTemplate();
    this.contextMenu = Menu.buildFromTemplate(this.template);
    this.addPauseToContextMenu();

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

  addPauseToContextMenu() {
    this.contextMenu.insert(
      3,
      new MenuItem({
        label: '暂停',
        icon: this.template[2].icon,
        click: () => {
          this.win.webContents.send('play');
        },
        visible: false,
      })
    );
  }

  handleEvents() {
    this.emitter.on('updateTooltip', title => this.tray.setToolTip(title));
    this.emitter.on('updatePlayState', isPlaying => {
      let items = this.contextMenu.items;
      items[isPlaying ? 2 : 3].visible = false;
      items[isPlaying ? 3 : 2].visible = true;
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

    this.addPauseToContextMenu();
    this.handleEvents();
  }

  addPauseToContextMenu() {
    this.contextMenu.insert(
      1,
      new MenuItem({
        label: '暂停',
        icon: this.template[0].icon,
        click: () => {
          this.win.webContents.send('play');
        },
        visible: false,
      })
    );
  }

  handleEvents() {
    this.tray.on('click', () => {
      this.win.show();
    });

    this.tray.on('right-click', () => {
      if (this.isPlaying !== this.curDisplayPlaying) {
        this.curDisplayPlaying = this.isPlaying;
        let items = this.contextMenu.items;
        items[this.isPlaying ? 0 : 1].visible = false;
        items[this.isPlaying ? 1 : 0].visible = true;
      }
      this.tray.popUpContextMenu(this.contextMenu);
    });

    this.emitter.on('updateTooltip', title => this.tray.setToolTip(title));
    this.emitter.on(
      'updatePlayState',
      isPlaying => (this.isPlaying = isPlaying)
    );
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
