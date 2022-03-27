import { StrictMode } from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import 'virtual:svg-icons-register'
import '@/styles/global.scss'
import App from './App'
import pkg from '../../../package.json'

Sentry.init({
  dsn: 'https://7cc7879b42ba4bed9f66fb6752558475@o436528.ingest.sentry.io/6274630',
  integrations: [new BrowserTracing()],
  release: `yesplaymusic@${pkg.version}`,
  environment: import.meta.env.MODE,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root'),
  window.removeLoading
)

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)

// Usage of ipcRenderer.on
window.ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})
