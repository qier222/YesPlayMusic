export {}

declare global {
  interface Window {
    // Expose some Api through preload script
    ipcRenderer?: import('electron').IpcRenderer
    env?: {
      isElectron: boolean
      isEnableTitlebar: boolean
      isLinux: boolean
      isMac: boolean
      isWin: boolean
    }
    rendererEvents?: {
      onMaximizeStateChanged(fn: (value: boolean) => void)
    }
  }
}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
