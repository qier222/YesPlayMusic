import { ReactNode } from 'react'
import * as Sentry from '@sentry/react'

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack }) => (
        <div
          role='alert'
          className='app-region-drag flex h-screen w-screen items-center justify-center rounded-24 bg-white dark:bg-black'
        >
          <div className='app-region-no-drag'>
            <p>Something went wrong:</p>
            <pre className='mb-2 text-18 dark:text-white'>
              {error.toString()}
            </pre>
            <div className='max-h-72 max-w-2xl overflow-scroll whitespace-pre-line rounded-12 border border-white/10 px-3 py-2 dark:text-white/50'>
              {componentStack?.trim()}
            </div>
            <button
              onClick={() => location.reload()}
              className='mt-4 rounded-full bg-brand-600 px-6 py-5 text-16 font-medium'
            >
              Reload
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}

export default ErrorBoundary
