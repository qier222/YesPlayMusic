import path from 'path'
import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
} from 'electron'
import { IpcChannels } from '@/shared/IpcChannels'
import { RepeatMode } from '@/shared/playerDataTypes'

const iconDirRoot =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), './src/main/assets/icons')
    : path.join(__dirname, './assets/icons')

enum MenuItemIDs {
  Play = 'play',
  Pause = 'pause',
  Like = 'like',
  Unlike = 'unlike',
}

export interface YPMTray {
  setTooltip(text: string): void
  setLikeState(isLiked: boolean): void
  setPlayState(isPlaying: boolean): void
  setRepeatMode(mode: RepeatMode): void
}

function createNativeImage(filename: string) {
  return nativeImage.createFromPath(path.join(iconDirRoot, filename))
}

function createMenuTemplate(win: BrowserWindow): MenuItemConstructorOptions[] {
  let template: MenuItemConstructorOptions[] =
    process.platform === 'linux'
      ? [
          {
            label: '显示主面板',
            click: () => win.show(),
          },
          {
            type: 'separator',
          },
        ]
      : []

  return template.concat([
    {
      label: '播放',
      click: () => win.webContents.send(IpcChannels.Play),
      icon: createNativeImage('play.png'),
      id: MenuItemIDs.Play,
    },
    {
      label: '暂停',
      click: () => win.webContents.send(IpcChannels.Pause),
      icon: createNativeImage('pause.png'),
      id: MenuItemIDs.Pause,
      visible: false,
    },
    {
      label: '上一首',
      click: () => win.webContents.send(IpcChannels.Previous),
      icon: createNativeImage('left.png'),
    },
    {
      label: '下一首',
      click: () => win.webContents.send(IpcChannels.Next),
      icon: createNativeImage('right.png'),
    },
    {
      label: '循环模式',
      icon: createNativeImage('repeat.png'),
      submenu: [
        {
          label: '关闭循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.Off),
          id: RepeatMode.Off,
          checked: true,
          type: 'radio',
        },
        {
          label: '列表循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.On),
          id: RepeatMode.On,
          type: 'radio',
        },
        {
          label: '单曲循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.One),
          id: RepeatMode.One,
          type: 'radio',
        },
      ],
    },
    {
      label: '加入喜欢',
      click: () => win.webContents.send(IpcChannels.Like),
      icon: createNativeImage('like.png'),
      id: MenuItemIDs.Like,
    },
    {
      label: '取消喜欢',
      click: () => win.webContents.send(IpcChannels.Like),
      icon: createNativeImage('unlike.png'),
      id: MenuItemIDs.Unlike,
      visible: false,
    },
    {
      label: '退出',
      click: () => app.exit(),
      icon: createNativeImage('exit.png'),
    },
  ])
}

class YPMTrayImpl implements YPMTray {
  private _win: BrowserWindow
  private _tray: Tray
  private _template: MenuItemConstructorOptions[]
  private _contextMenu: Menu

  constructor(win: BrowserWindow) {
    this._win = win
    const icon = createNativeImage('menu@88.png').resize({
      height: 20,
      width: 20,
    })
    this._tray = new Tray(icon)
    this._template = createMenuTemplate(this._win)
    this._contextMenu = Menu.buildFromTemplate(this._template)

    this._updateContextMenu()
    this.setTooltip('YesPlayMusic')

    this._tray.on('click', () => win.show())
  }

  private _updateContextMenu() {
    this._tray.setContextMenu(this._contextMenu)
  }

  setTooltip(text: string) {
    this._tray.setToolTip(text)
  }

  setLikeState(isLiked: boolean) {
    this._contextMenu.getMenuItemById(MenuItemIDs.Like)!.visible = !isLiked
    this._contextMenu.getMenuItemById(MenuItemIDs.Unlike)!.visible = isLiked
    this._updateContextMenu()
  }

  setPlayState(isPlaying: boolean) {
    this._contextMenu.getMenuItemById(MenuItemIDs.Play)!.visible = !isPlaying
    this._contextMenu.getMenuItemById(MenuItemIDs.Pause)!.visible = isPlaying
    this._updateContextMenu()
  }

  setRepeatMode(mode: RepeatMode) {
    const item = this._contextMenu.getMenuItemById(mode)
    if (item) {
      item.checked = true
      this._updateContextMenu()
    }
  }
}

export function createTray(win: BrowserWindow): YPMTray {
  return new YPMTrayImpl(win)
}
