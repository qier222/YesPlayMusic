import { IpcChannelsParams, IpcChannelsReturns } from '@/shared/IpcChannels'
import { ElectronLog } from 'electron-log'
import type { Howl } from 'howler'

export {}

declare global {
  interface Window {
    ipcRenderer?: {
      sendSync: <T extends keyof IpcChannelsParams>(
        channel: T,
        params?: IpcChannelsParams[T]
      ) => IpcChannelsReturns[T]
      send: <T extends keyof IpcChannelsParams>(
        channel: T,
        params?: IpcChannelsParams[T]
      ) => void
      on: <T extends keyof IpcChannelsParams>(
        channel: T,
        listener: (
          event: Electron.IpcRendererEvent,
          value: IpcChannelsReturns[T]
        ) => void
      ) => void
    }
    howler: Howl
    env?: {
      isElectron: boolean
      isEnableTitlebar: boolean
      isLinux: boolean
      isMac: boolean
      isWin: boolean
    }
    log?: ElectronLog
  }
}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
