import { IpcChannels } from '@/shared/IpcChannels'
import { proxy } from 'valtio'

interface UIStates {
  showLyricPanel: boolean
  showLoginPanel: boolean
  hideTopbarBackground: boolean
  librarySelectedTab: 'playlists' | 'albums' | 'artists' | 'videos'
  mobileShowPlayingNext: boolean
  blurBackgroundImage: string | null
  fullscreen: boolean
}

const initUIStates: UIStates = {
  showLyricPanel: false,
  showLoginPanel: false,
  hideTopbarBackground: false,
  librarySelectedTab: 'playlists',
  mobileShowPlayingNext: false,
  blurBackgroundImage: null,
  fullscreen: false,
}

window.ipcRenderer
  ?.invoke(IpcChannels.IsMaximized)
  .then(isMaximized => (initUIStates.fullscreen = !!isMaximized))

export default proxy<UIStates>(initUIStates)
