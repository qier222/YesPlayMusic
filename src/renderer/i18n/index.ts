import { createI18n } from 'vue-i18n'

import en from './lang/en'
import zhCN from './lang/zh-CN'
import zhTW from './lang/zh-TW'
import tr from './lang/tr'

const i18n = createI18n({
  locale: 'en', // TODO: 从store读取
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    tr,
  },
  silentTranslationWarn: true,
})

export default i18n
