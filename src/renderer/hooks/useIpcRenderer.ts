import { IpcChannels } from '@/main/IpcChannelsName'
import { useEffect } from 'react'

const useIpcRenderer = (
  channcel: IpcChannels,
  listener: (event: any, ...args: any[]) => void
) => {
  useEffect(() => {
    return window.ipcRenderer?.on(channcel, listener)
  }, [])
}

export default useIpcRenderer
