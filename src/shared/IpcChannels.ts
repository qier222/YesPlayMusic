import { APIs } from './CacheAPIs'
import { RepeatMode } from './playerDataTypes'

export const enum IpcChannels {
  ClearAPICache = 'clear-api-cache',
  Minimize = 'minimize',
  MaximizeOrUnmaximize = 'maximize-or-unmaximize',
  Close = 'close',
  IsMaximized = 'is-maximized',
  GetApiCacheSync = 'get-api-cache-sync',
  DevDbExportJson = 'dev-db-export-json',
  CacheCoverColor = 'cache-cover-color',
  SetTrayTooltip = 'set-tray-tooltip',
  // 准备三个播放相关channel, 为 mpris 预留接口
  Play = 'play',
  Pause = 'pause',
  PlayOrPause = 'play-or-pause',
  Next = 'next',
  Previous = 'previous',
  Like = 'like',
  Repeat = 'repeat',
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
}
