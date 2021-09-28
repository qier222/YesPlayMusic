import { createApp } from 'vue'
import App from '@renderer/App.vue'
import store from '@renderer/store'
import router from '@renderer/router'
import i18n from '@renderer/i18n'
import 'virtual:svg-icons-register'
import '@renderer/assets/styles/global.scss'
import VueGtag from 'vue-gtag'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import pkg from '../../package.json'

const app = createApp(App)

Sentry.init({
  app,
  dsn: 'https://9172c69fb1a14545bbbcaa74d5987b59@o436528.ingest.sentry.io/6132056',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ['localhost', 'music.qier222.com', '127.0.0.1', /^\//],
    }),
  ],
  release: `yesplaymusic@${pkg.version}`,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})

console.log(import.meta.env)

app
  .use(store)
  .use(router)
  .use(i18n)
  .use(
    VueGtag,
    {
      appName: 'YesPlayMusic',
      pageTrackerScreenviewEnabled: true,
      config: { id: 'UA-180189423-1' },
    },
    router
  )
  .mount('#app')
