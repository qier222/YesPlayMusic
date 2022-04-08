const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
  sendSync: ipcRenderer.sendSync,
  send: ipcRenderer.send,
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  }
})
contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  isEnableTitlebar:
    process.platform === 'win32' || process.platform === 'linux',
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
})