import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-cn.json'
import enUS from './locales/en-us.json'

export const supportedLanguages = ['zh-CN', 'en-US'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

declare module 'react-i18next' {
  interface CustomTypeOptions {
    returnNull: false
    resources: {
      'en-US': typeof enUS
      'zh-CN': typeof enUS
    }
  }
}

export const getInitLanguage = () => {
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
  returnNull: false,
  resources: {
    'en-US': { translation: enUS },
    'zh-CN': { translation: zhCN },
  },
  lng: getInitLanguage(),
  fallbackLng: 'en-US',
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
})

export default i18next
