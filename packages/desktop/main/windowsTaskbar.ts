import { IpcChannels } from '@/shared/IpcChannels'
import { BrowserWindow, nativeImage, ThumbarButton } from 'electron'
import path from 'path'

enum ItemKeys {
  Play = 'play',
  Pause = 'pause',
  Previous = 'previous',
  Next = 'next',
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
    .set(ItemKeys.Previous, {
      click: () => win.webContents.send(IpcChannels.Previous),
      icon: createNativeImage('previous.png'),
      tooltip: '上一首',
    })
    .set(ItemKeys.Next, {
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
  private _previous: ThumbarButton
  private _next: ThumbarButton

  constructor(win: BrowserWindow) {
    this._win = win
    this._buttons = createThumbarButtons(win)

    this._playOrPause = this._buttons.get(ItemKeys.Play)!
    this._previous = this._buttons.get(ItemKeys.Previous)!
    this._next = this._buttons.get(ItemKeys.Next)!
  }

  private _updateThumbarButtons(clear: boolean) {
    this._win.setThumbarButtons(
      clear ? [] : [this._previous, this._playOrPause, this._next]
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
