import './utils/initLog'
import './utils/theme'
import { StrictMode } from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import 'virtual:svg-icons-register'
import './styles/global.css'
import './styles/accentColor.css'
import App from './AppNew'
import pkg from '../../package.json'
import ReactGA from 'react-ga4'
import { ipcRenderer } from './ipcRenderer'
import { QueryClientProvider } from 'react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

ReactGA.initialize('G-KMJJCFZDKF')

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

ipcRenderer()

const container = document.getElementById('root') as HTMLElement
const root = ReactDOMClient.createRoot(container)

root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={reactQueryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
