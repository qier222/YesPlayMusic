import { css, cx } from '@emotion/css'
import Router from './Router'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import uiStates from '@/web/states/uiStates'
import { useEffect, useRef, useState } from 'react'
import { breakpoint as bp, ease } from '@/web/utils/const'
import { useSnapshot } from 'valtio'
import persistedUiStates from '@/web/states/persistedUiStates'
import { motion, useAnimation } from 'framer-motion'
import { sleep } from '@/web/utils/common'
import player from '@/web/states/player'

const Main = () => {
  const playerSnapshot = useSnapshot(player)

  // Show/hide topbar background
  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen } = useIntersectionObserver(observePoint)
  useEffect(() => {
    uiStates.hideTopbarBackground = onScreen
    return () => {
      uiStates.hideTopbarBackground = false
    }
  }, [onScreen])

  // Change width when player is minimized

  const { minimizePlayer } = useSnapshot(persistedUiStates)
  const [isMaxWidth, setIsMaxWidth] = useState(minimizePlayer)
  const controlsMain = useAnimation()
  useEffect(() => {
    const animate = async () => {
      await controlsMain.start({ opacity: 0 })
      await sleep(100)
      setIsMaxWidth(minimizePlayer)
      await controlsMain.start({ opacity: 1 })
    }
    if (minimizePlayer !== isMaxWidth) animate()
  }, [controlsMain, isMaxWidth, minimizePlayer])

  return (
    <motion.main
      id='main'
      animate={controlsMain}
      transition={{ ease, duration: 0.4 }}
      className={cx(
        'no-scrollbar z-10 h-screen overflow-y-auto',
        css`
          ${bp.lg} {
            margin-left: 144px;
            margin-right: ${isMaxWidth || !playerSnapshot.track ? 92 : 382}px;
          }
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
    </motion.main>
  )
}

export default Main
