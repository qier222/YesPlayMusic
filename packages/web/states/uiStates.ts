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
  playingVideoID: number | null
  isPauseVideos: boolean
}

const initUIStates: UIStates = {
  showLyricPanel: false,
  showLoginPanel: false,
  hideTopbarBackground: false,
  librarySelectedTab: 'playlists',
  mobileShowPlayingNext: false,
  blurBackgroundImage: null,
  fullscreen: false,
  playingVideoID: null,
  isPauseVideos: false,
}

window.ipcRenderer
  ?.invoke(IpcChannels.IsMaximized)
  .then(isMaximized => (initUIStates.fullscreen = !!isMaximized))

const uiStates = proxy<UIStates>(initUIStates)
export default uiStates

export const closeVideoPlayer = () => {
  uiStates.playingVideoID = null
}
