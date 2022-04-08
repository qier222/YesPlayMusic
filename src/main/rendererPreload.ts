import { IpcChannels } from '@/main/IpcChannelsName'
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
  sendSync: ipcRenderer.sendSync,
  send: ipcRenderer.send,
  on: (
    channel: IpcChannels,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.on(channel, listener)
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },
})
contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  isEnableTitlebar:
    process.platform === 'win32' || process.platform === 'linux',
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
})
