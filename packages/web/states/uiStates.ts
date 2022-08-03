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
  fullscreen: window.ipcRenderer?.sendSync(IpcChannels.IsMaximized) || false,
}

export default proxy<UIStates>(initUIStates)
