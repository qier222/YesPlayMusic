import Vue from "vue";
import VueI18n from "vue-i18n";
import store from "@/store";

import en from "./lang/en.js";
import zhCN from "./lang/zh-CN.js";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: store.state.settings.lang,
  messages: {
    en,
    "zh-CN": zhCN,
  },
  silentTranslationWarn: true,
});

export default i18n;
