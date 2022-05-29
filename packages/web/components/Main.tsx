import Router from './Router'
import Topbar from './Topbar'
import { cx } from '@emotion/css'

const Main = () => {
  return (
    <div
      id='mainContainer'
      className='relative flex h-screen max-h-screen flex-grow flex-col overflow-y-auto bg-white dark:bg-[#1d1d1d]'
    >
      <Topbar />
      <main
        id='main'
        className={cx(
          'mb-24 flex-grow px-8',
          window.env?.isEnableTitlebar && 'mt-8'
        )}
      >
        <Router />
      </main>
    </div>
  )
}

export default Main
