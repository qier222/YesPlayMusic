import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import pkg from '../../../package.json'
import log from './log'

log.info(`[sentry] sentry initializing`)

Sentry.init({
  dsn: 'https://2aaaa67f1c3d4d6baefafa5d58fcf340@o436528.ingest.sentry.io/6274637',
  release: `yesplaymusic@${pkg.version}`,
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

log.info(`[sentry] sentry initialized`)
