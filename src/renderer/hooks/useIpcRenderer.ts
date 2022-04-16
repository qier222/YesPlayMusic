import { IpcChannelsParams, IpcChannelsReturns } from '@/shared/IpcChannels'
import { useEffect } from 'react'


const useIpcRenderer = <T extends keyof IpcChannelsParams> (
  channcel: T,
  listener: (event: any, value: IpcChannelsReturns[T]) => void
) => {
  useEffect(() => {
    return window.ipcRenderer?.on(channcel, listener)
  }, [])
}

export default useIpcRenderer
