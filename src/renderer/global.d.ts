export {}

declare global {
  interface Window {
    // Expose some Api through preload script
    ipcRenderer?: import('electron').IpcRenderer
    isElectron?: boolean
  }
}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
