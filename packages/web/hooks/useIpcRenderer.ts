import { IpcChannels, IpcChannelsReturns } from '@/shared/IpcChannels'
import { useEffect } from 'react'

const useIpcRenderer = <T extends IpcChannels>(
  channel: T,
  listener: (event: any, value: IpcChannelsReturns[T]) => void
) => {
  useEffect(() => {
    return window.ipcRenderer?.on(channel, listener)
  }, [])
}

export default useIpcRenderer
