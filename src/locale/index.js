import Vue from "vue";
import VueI18n from "vue-i18n";

import en from "./lang/en.js";
import zhCN from "./lang/zh-CN.js";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  messages: {
    en,
    "zh-CN": zhCN
  }
});

export default i18n;
