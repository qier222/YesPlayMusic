import Main from '@/web/components/New/Main'
import Player from '@/web/components/New/Player'
import MenuBar from '@/web/components/New/MenuBar'
import Topbar from '@/web/components/New/Topbar/TopbarDesktop'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const showPlayer = useMemo(() => !!playerSnapshot.track, [playerSnapshot])

  return (
    <div
      id='layout'
      className={cx(
        'relative grid h-screen select-none overflow-hidden bg-white dark:bg-black',
        window.env?.isElectron && 'rounded-24',
        css`
          grid-template-columns: 6.5rem auto 358px;
          grid-template-rows: 132px auto;
        `,
        showPlayer
          ? css`
              grid-template-areas:
                'menubar main -'
                'menubar main player';
            `
          : css`
              grid-template-areas:
                'menubar main main'
                'menubar main main';
            `
      )}
    >
      <MenuBar />
      <Topbar />
      <Main />
      {showPlayer && <Player />}
    </div>
  )
}

export default Layout
