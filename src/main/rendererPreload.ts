import { IpcRendererEvent } from "electron"

const { contextBridge, ipcRenderer } = require('electron')

enum EventKeys {
  IS_MAXIMIZED = 'is-maximized',
}

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  isEnableTitlebar:
    process.platform === 'win32' || process.platform === 'linux',
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
})

contextBridge.exposeInMainWorld('onApi', {
  maximizedStateChanged: (fn: (value: boolean) => void) => {
    const safeFn = (e: IpcRendererEvent, value: boolean) => fn(value)
    addListener(EventKeys.IS_MAXIMIZED, safeFn)
  },
})

/**
 * 用于包装传入ipcRenderer.on的function
 * 避免renderer多次订阅事件造成内存泄漏
 */
const addListener = (
  key: string,
  fn: (event: IpcRendererEvent, ...args: any[]) => void
) => {
  const oldFn = listenerMap[key]
  if (oldFn) ipcRenderer.removeListener(key, oldFn)
  ipcRenderer.on(key, fn)
  listenerMap[key] = fn
}

const listenerMap: {
  [key: string]: (event: IpcRendererEvent, ...args: any[]) => void
} = {}
