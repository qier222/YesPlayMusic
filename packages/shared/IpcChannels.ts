import { AppleMusicAlbum, AppleMusicArtist } from './AppleMusic'
import { APIs } from './CacheAPIs'
import { RepeatMode } from './playerDataTypes'

export const enum IpcChannels {
  ClearAPICache = 'ClearAPICache',
  Minimize = 'Minimize',
  MaximizeOrUnmaximize = 'MaximizeOrUnmaximize',
  Close = 'Close',
  IsMaximized = 'IsMaximized',
  FullscreenStateChange = 'FullscreenStateChange',
  GetApiCache = 'GetApiCache',
  DevDbExportJson = 'DevDbExportJson',
  CacheCoverColor = 'CacheCoverColor',
  SetTrayTooltip = 'SetTrayTooltip',
  // 准备三个播放相关channel, 为 mpris 预留接口
  Play = 'Play',
  Pause = 'Pause',
  PlayOrPause = 'PlayOrPause',
  Next = 'Next',
  Previous = 'Previous',
  Like = 'Like',
  Repeat = 'Repeat',
  SyncSettings = 'SyncSettings',
  GetAudioCacheSize = 'GetAudioCacheSize',
  ResetWindowSize = 'ResetWindowSize',
  GetAlbumFromAppleMusic = 'GetAlbumFromAppleMusic',
  GetArtistFromAppleMusic = 'GetArtistFromAppleMusic',
  Logout = 'Logout',
}

// ipcMain.on params
export interface IpcChannelsParams {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: void
  [IpcChannels.FullscreenStateChange]: void
  [IpcChannels.GetApiCache]: {
    api: APIs
    query?: any
  }
  [IpcChannels.DevDbExportJson]: void
  [IpcChannels.CacheCoverColor]: {
    id: number
    color: string
  }
  [IpcChannels.SetTrayTooltip]: {
    text: string
  }
  [IpcChannels.Play]: void
  [IpcChannels.Pause]: void
  [IpcChannels.PlayOrPause]: void
  [IpcChannels.Next]: void
  [IpcChannels.Previous]: void
  [IpcChannels.Like]: {
    isLiked: boolean
  }
  [IpcChannels.Repeat]: {
    mode: RepeatMode
  }
  [IpcChannels.SyncSettings]: any
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.ResetWindowSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: {
    id: number
    name: string
    artist: string
  }
  [IpcChannels.GetArtistFromAppleMusic]: { id: number; name: string }
  [IpcChannels.Logout]: void
}

// ipcRenderer.on params
export interface IpcChannelsReturns {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: boolean
  [IpcChannels.FullscreenStateChange]: boolean
  [IpcChannels.GetApiCache]: any
  [IpcChannels.DevDbExportJson]: void
  [IpcChannels.CacheCoverColor]: void
  [IpcChannels.SetTrayTooltip]: void
  [IpcChannels.Play]: void
  [IpcChannels.Pause]: void
  [IpcChannels.PlayOrPause]: void
  [IpcChannels.Next]: void
  [IpcChannels.Previous]: void
  [IpcChannels.Like]: void
  [IpcChannels.Repeat]: RepeatMode
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: AppleMusicAlbum | undefined
  [IpcChannels.GetArtistFromAppleMusic]: AppleMusicArtist | undefined
  [IpcChannels.Logout]: void
}
