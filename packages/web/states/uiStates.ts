import { proxy } from 'valtio'

interface UIStates {
  showLyricPanel: boolean
  showLoginPanel: boolean
  hideTopbarBackground: boolean
  librarySelectedTab: 'playlists' | 'albums' | 'artists' | 'videos'
  mobileShowPlayingNext: boolean
}

const initUIStates: UIStates = {
  showLyricPanel: false,
  showLoginPanel: false,
  hideTopbarBackground: false,
  librarySelectedTab: 'playlists',
  mobileShowPlayingNext: false,
}

export default proxy<UIStates>(initUIStates)
