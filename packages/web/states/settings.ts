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

const settingsInLocalStorage = localStorage.getItem('settings')
const settings = proxy<Settings>(
  merge(
    initSettings,
    settingsInLocalStorage ? JSON.parse(settingsInLocalStorage) : {}
  )
)

subscribe(settings, () => {
  localStorage.setItem('settings', JSON.stringify(settings))
})
subscribe(settings, () => {
  window.ipcRenderer?.send(IpcChannels.SyncSettings, settings)
})

export default settings
