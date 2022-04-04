const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
})
