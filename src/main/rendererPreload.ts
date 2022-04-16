/* eslint-disable @typescript-eslint/no-var-requires */
import { IpcChannels } from '@/shared/IpcChannels'
const { contextBridge, ipcRenderer } = require('electron')
const log = require('electron-log')

const isDev = process.env.NODE_ENV === 'development'

log.transports.file.level = 'info'
log.variables.process = 'renderer'
log.transports.console.format = isDev
  ? `[{process}] {text}`
  : `[{process}] {h}:{i}:{s}{scope} {level} › {text}`
contextBridge.exposeInMainWorld('log', log)

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
