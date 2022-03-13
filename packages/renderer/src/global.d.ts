export {}

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import('fs')
    ipcRenderer: import('electron').IpcRenderer
    removeLoading: () => void
  }
}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
