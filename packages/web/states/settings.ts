import { IpcChannels } from '@/shared/IpcChannels'
import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'

interface Settings {
  accentColor: string
  unm: {
    enabled: boolean
    sources: Array<
      'migu' | 'kuwo' | 'kugou' | 'ytdl' | 'qq' | 'bilibili' | 'joox'
    >
    searchMode: 'order-first' | 'fast-first'
    proxy: null | {
      protocol: 'http' | 'https' | 'socks5'
      host: string
      port: number
      username?: string
      password?: string
    }
    cookies: {
      qq?: string
      joox?: string
    }
  }
}

const initSettings: Settings = {
  accentColor: 'blue',
  unm: {
    enabled: true,
    sources: ['migu'],
    searchMode: 'order-first',
    proxy: null,
    cookies: {},
  },
}

const STORAGE_KEY = 'settings'
const statesInStorageString = localStorage.getItem(STORAGE_KEY)
let statesInStorage = {}
if (statesInStorageString) {
  try {
    statesInStorage = JSON.parse(statesInStorageString)
  } catch {
    // ignore
  }
}

const settings = proxy<Settings>(merge(initSettings, statesInStorage))

subscribe(settings, () => {
  window.ipcRenderer?.send(IpcChannels.SyncSettings, settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
})

export default settings
