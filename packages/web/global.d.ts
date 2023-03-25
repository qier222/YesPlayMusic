import { IpcChannelsParams, IpcChannelsReturns } from '@/shared/IpcChannels'
import { ElectronLog } from 'electron-log'

export {}

declare global {
  interface Window {
    ipcRenderer?: {
      sendSync: <T extends keyof IpcChannelsParams>(
        channel: T,
        params?: IpcChannelsParams[T]
      ) => IpcChannelsReturns[T]
      invoke: <T extends keyof IpcChannelsParams>(
        channel: T,
        params?: IpcChannelsParams[T]
      ) => Promise<IpcChannelsReturns[T]>
      send: <T extends keyof IpcChannelsParams>(channel: T, params?: IpcChannelsParams[T]) => void
      on: <T extends keyof IpcChannelsParams>(
        channel: T,
        listener: (event: Electron.IpcRendererEvent, value: IpcChannelsReturns[T]) => void
      ) => void
    }
    env?: {
      isElectron: boolean
      isEnableTitlebar: boolean
      isLinux: boolean
      isMac: boolean
      isWindows: boolean
    }
    log?: ElectronLog
  }
}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
