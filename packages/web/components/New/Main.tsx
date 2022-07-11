import { css, cx } from '@emotion/css'
import Router from './Router'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import uiStates from '@/web/states/uiStates'
import { useEffect, useRef } from 'react'

const Main = () => {
  // Show/hide topbar background
  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen } = useIntersectionObserver(observePoint)
  useEffect(() => {
    uiStates.hideTopbarBackground = onScreen
    return () => {
      uiStates.hideTopbarBackground = false
    }
  }, [onScreen])

  return (
    <main
      className={cx(
        'no-scrollbar overflow-y-auto pb-16 pr-6 pl-10',
        css`
          grid-area: main;
        `
      )}
    >
      <div ref={observePoint}></div>
      <div
        className={css`
          margin-top: 132px;
        `}
      >
        <Router />
      </div>
    </main>
  )
}

export default Main
