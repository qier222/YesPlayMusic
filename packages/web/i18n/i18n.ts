import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-cn.json'
import enUS from './locales/en-us.json'
import { subscribe } from 'valtio'
import settings from '../states/settings'

export const supportedLanguages = ['zh-CN', 'en-US'] as const

export const getLanguage = () => {
  // Get language from settings
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    if (supportedLanguages.includes(settings.language)) {
      return settings.language
    }
  } catch (e) {
    // ignore
  }

  // Get language from browser
  if (navigator.language.startsWith('zh-')) {
    return 'zh-CN'
  }

  // Fallback to English
  return 'en-US'
}

i18next.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'zh-CN': { translation: zhCN },
  },
  lng: getLanguage(),
  // lng: 'zh-CN',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
})

export default i18next
