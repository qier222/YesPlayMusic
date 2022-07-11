import Main from '@/web/components/New/Main'
import Player from '@/web/components/New/Player'
import MenuBar from '@/web/components/New/MenuBar'
import Topbar from '@/web/components/New/Topbar/TopbarDesktop'
import { css, cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import Login from './Login'
import TrafficLight from './TrafficLight'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const showPlayer = !!playerSnapshot.track

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
      <Login />
      {showPlayer && <Player />}

      {window.env?.isMac && (
        <div className='fixed top-6 left-6 z-30 translate-y-0.5'>
          <TrafficLight />
        </div>
      )}
    </div>
  )
}

export default Layout
