import 'react-i18next'
import enUS from './locales/en-us.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      'en-US': typeof enUS
      'zh-CN': typeof enUS
    }
  }
}
