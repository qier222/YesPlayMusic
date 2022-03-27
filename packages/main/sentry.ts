import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import pkg from '../../package.json'

Sentry.init({
  dsn: 'https://2aaaa67f1c3d4d6baefafa5d58fcf340@o436528.ingest.sentry.io/6274637',
  release: `yesplaymusic@${pkg.version}`,
  environment: import.meta.env.MODE,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})
