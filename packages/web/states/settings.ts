import { IpcChannels } from '@/shared/IpcChannels'
import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'
import i18n, { getLanguage, supportedLanguages } from '../i18n/i18n'

interface Settings {
  accentColor: string
  language: typeof supportedLanguages[number]
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
  language: getLanguage(),
  unm: {
    enabled: true,
    sources: ['migu'],
    searchMode: 'order-first',
    proxy: null,
    cookies: {},
  },
}

const STORAGE_KEY = 'settings'

let statesInStorage = {}
try {
  statesInStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
} catch {
  // ignore
}

const settings = proxy<Settings>(merge(initSettings, statesInStorage))

subscribe(settings, () => {
  if (
    settings.language !== i18n.language &&
    supportedLanguages.includes(settings.language)
  ) {
    i18n.changeLanguage(settings.language)
  }

  window.ipcRenderer?.send(IpcChannels.SyncSettings, settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
})

export default settings
