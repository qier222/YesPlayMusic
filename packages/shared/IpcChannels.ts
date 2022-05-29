import { APIs } from './CacheAPIs'
import { RepeatMode } from './playerDataTypes'
import { Store } from '@/shared/store'

export const enum IpcChannels {
  ClearAPICache = 'ClearAPICache',
  Minimize = 'Minimize',
  MaximizeOrUnmaximize = 'MaximizeOrUnmaximize',
  Close = 'Close',
  IsMaximized = 'IsMaximized',
  GetApiCacheSync = 'GetApiCacheSync',
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
}

// ipcMain.on params
export interface IpcChannelsParams {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: void
  [IpcChannels.GetApiCacheSync]: {
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
  [IpcChannels.SyncSettings]: Store['settings']
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.ResetWindowSize]: void
}

// ipcRenderer.on params
export interface IpcChannelsReturns {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: boolean
  [IpcChannels.GetApiCacheSync]: any
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
}
