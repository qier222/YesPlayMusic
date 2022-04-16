import { APIs } from './CacheAPIs'

export const enum IpcChannels {
  ClearAPICache = 'clear-api-cache',
  Minimize = 'minimize',
  MaximizeOrUnmaximize = 'maximize-or-unmaximize',
  Close = 'close',
  IsMaximized = 'is-maximized',
  GetApiCacheSync = 'get-api-cache-sync',
  DevDbExportJson = 'dev-db-export-json',
  CacheCoverColor = 'cache-cover-color',
}

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
}

export interface IpcChannelsReturns {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: boolean
  [IpcChannels.GetApiCacheSync]: any
  [IpcChannels.DevDbExportJson]: void
  [IpcChannels.CacheCoverColor]: void
}
