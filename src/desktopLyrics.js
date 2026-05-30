import Vue from 'vue';
import DesktopLyrics from '@/components/DesktopLyrics.vue';
import '@/assets/icons';

Vue.config.productionTip = false;

new Vue({
  render: h => h(DesktopLyrics),
}).$mount('#app');
