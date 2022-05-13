/* eslint-disable @typescript-eslint/no-var-requires */
import { IpcChannels } from '@/shared/IpcChannels'
import { isLinux, isMac, isWindows } from './utils'
const { contextBridge, ipcRenderer } = require('electron')
const log = require('electron-log')

log.transports.file.level = 'info'
log.transports.ipc.level = false
log.variables.process = 'renderer'
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
  isLinux,
  isMac,
  isWindows,
})
