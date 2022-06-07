import Player from '@/web/components/New/PlayerMobile'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import Router from '@/web/components/New/Router'
import MenuBar from './MenuBar'

const LayoutMobile = () => {
  const playerSnapshot = useSnapshot(player)
  const showPlayer = useMemo(() => !!playerSnapshot.track, [playerSnapshot])

  return (
    <div id='layout' className='select-none bg-white pb-32 pt-3 dark:bg-black'>
      <main className='min-h-screen overflow-y-auto overflow-x-hidden px-2.5 pb-16'>
        <Router />
      </main>
      {showPlayer && (
        <div
          className={cx(
            'fixed left-7 right-7',
            css`
              bottom: 72px;
            `
          )}
        >
          <Player />
        </div>
      )}
      <div className='fixed bottom-0 left-0 right-0 py-3 dark:bg-black'>
        <MenuBar />
      </div>
    </div>
  )
}

export default LayoutMobile
