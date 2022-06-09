import Player from '@/web/components/New/PlayerMobile'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import Router from '@/web/components/New/Router'
import MenuBar from './MenuBar'
import TopbarMobile from './Topbar/TopbarMobile'
import { isIOS, isPWA, isSafari } from '@/web/utils/common'

const LayoutMobile = () => {
  const playerSnapshot = useSnapshot(player)
  const showPlayer = useMemo(() => !!playerSnapshot.track, [playerSnapshot])

  return (
    <div id='layout' className='select-none bg-white pb-32 pt-3 dark:bg-black'>
      <main className='min-h-screen overflow-y-auto overflow-x-hidden pb-16'>
        <TopbarMobile />
        <Router />
      </main>
      <div
        className={cx(
          'fixed bottom-0 left-0 right-0 pt-3 dark:bg-black',
          css`
            padding-bottom: calc(
              ${isIOS && isSafari && isPWA
                  ? '24px'
                  : 'env(safe-area-inset-bottom)'} + 0.75rem
            );
          `
        )}
      >
        {showPlayer && (
          <div
            className={cx(
              'absolute left-7 right-7',
              css`
                top: calc(
                  -100% - 6px + ${isIOS && isSafari && isPWA ? '24px' : 'env(safe-area-inset-bottom)'}
                );
              `
            )}
          >
            <Player />
          </div>
        )}

        <MenuBar />
      </div>

      {/* Notch background */}
      {isIOS && isSafari && isPWA && (
        <div
          className={cx(
            'fixed left-0 right-0 bg-black/30 backdrop-blur-sm',
            css`
              top: -50px;
              height: 50px;
            `
          )}
        ></div>
      )}
    </div>
  )
}

export default LayoutMobile
