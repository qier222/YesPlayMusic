import Vue from "vue";
import VueAnalytics from "vue-analytics";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/icons";
import "@/utils/filters";
import { initMediaSession } from "@/utils/mediaSession";
import "./registerServiceWorker";

Vue.use(VueAnalytics, {
  id: "UA-180189423-1",
  router,
});

Vue.config.productionTip = false;

initMediaSession();

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
