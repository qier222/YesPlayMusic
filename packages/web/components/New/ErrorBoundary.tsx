import { ReactNode } from 'react'
import { ErrorBoundary as ErrorBoundaryRaw } from 'react-error-boundary'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div
      role='alert'
      className='app-region-drag flex h-screen w-screen items-center justify-center bg-white dark:bg-black'
    >
      <div className='app-region-no-drag'>
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button
          onClick={resetErrorBoundary}
          className='mt-4 rounded-full bg-brand-600 px-6 py-5 text-16 font-medium'
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundaryRaw
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ErrorBoundaryRaw>
  )
}

export default ErrorBoundary
