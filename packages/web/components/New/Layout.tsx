import Main from '@/web/components/New/Main'
import Player from '@/web/components/New/Player'
import Sidebar from '@/web/components/New/Sidebar'
import Topbar from '@/web/components/New/Topbar'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot])

  return (
    <div
      id='layout'
      className={cx(
        'grid h-screen select-none  overflow-hidden rounded-24 bg-white dark:bg-black',
        css`
          grid-template-columns: 6.5rem auto 358px;
          grid-template-rows: 132px auto;
        `,
        track
          ? css`
              grid-template-areas:
                'sidebar main -'
                'sidebar main player';
            `
          : css`
              grid-template-areas:
                'sidebar main main'
                'sidebar main main';
            `
      )}
    >
      <Sidebar />
      <Topbar />
      <Main />
      {track && <Player />}
    </div>
  )
}

export default Layout
