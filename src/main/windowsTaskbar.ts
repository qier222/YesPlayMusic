import { IpcChannels } from '@/shared/IpcChannels'
import { BrowserWindow, nativeImage, ThumbarButton } from 'electron'
import path from 'path'

enum ItemKeys {
  Play = 'play',
  Pause = 'pause',
  Forward = 'forward',
  Backward = 'backward',
}

type ThumbarButtonMap = Map<ItemKeys, ThumbarButton>

const iconDirRoot =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), './src/main/assets/icons/taskbar')
    : path.join(__dirname, './assets/icons/taskbar')

function createNativeImage(filename: string) {
  return nativeImage.createFromPath(path.join(iconDirRoot, filename))
}

function createThumbarButtons(win: BrowserWindow): ThumbarButtonMap {
  return new Map<ItemKeys, ThumbarButton>()
    .set(ItemKeys.Play, {
      click: () => win.webContents.send(IpcChannels.Play),
      icon: createNativeImage('play.png'),
      tooltip: '播放',
    })
    .set(ItemKeys.Pause, {
      click: () => win.webContents.send(IpcChannels.Pause),
      icon: createNativeImage('pause.png'),
      tooltip: '暂停',
    })
    .set(ItemKeys.Backward, {
      click: () => win.webContents.send(IpcChannels.Previous),
      icon: createNativeImage('previous.png'),
      tooltip: '上一首',
    })
    .set(ItemKeys.Forward, {
      click: () => win.webContents.send(IpcChannels.Next),
      icon: createNativeImage('next.png'),
      tooltip: '下一首',
    })
}

export interface Thumbar {
  setPlayState(isPlaying: boolean): void
}

class ThumbarImpl implements Thumbar {
  private _win: BrowserWindow
  private _buttons: ThumbarButtonMap

  private _playOrPause: ThumbarButton
  private _forward: ThumbarButton
  private _backward: ThumbarButton

  constructor(win: BrowserWindow) {
    this._win = win
    this._buttons = createThumbarButtons(win)

    this._playOrPause = this._buttons.get(ItemKeys.Play)!
    this._forward = this._buttons.get(ItemKeys.Forward)!
    this._backward = this._buttons.get(ItemKeys.Backward)!

    this._updateThumbarButtons(true)
  }

  private _updateThumbarButtons(clear: boolean) {
    this._win.setThumbarButtons(
      clear
        ? []
        : [this._backward, this._playOrPause, this._forward]
    )
  }

  setPlayState(isPlaying: boolean) {
    this._playOrPause = this._buttons.get(
      isPlaying ? ItemKeys.Pause : ItemKeys.Play
    )!
    this._updateThumbarButtons(false)
  }
}

export function createTaskbar(win: BrowserWindow): Thumbar {
  return new ThumbarImpl(win)
}
