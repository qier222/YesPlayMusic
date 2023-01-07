import Main from '@/web/components/Main'
import Player from '@/web/components/Player'
import MenuBar from '@/web/components/MenuBar'
import Topbar from '@/web/components/Topbar/TopbarDesktop'
import { cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import Login from './Login'
import TrafficLight from './TrafficLight'
import BlurBackground from './BlurBackground'
import TitleBar from './TitleBar'
import uiStates from '@/web/states/uiStates'
import ContextMenus from './ContextMenus/ContextMenus'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const { fullscreen } = useSnapshot(uiStates)
  const showPlayer = !!playerSnapshot.track

  return (
    <div
      id='layout'
      className={cx(
        'relative grid h-screen select-none overflow-hidden bg-white dark:bg-black',
        window.env?.isElectron && !fullscreen && 'rounded-24'
      )}
    >
      <BlurBackground />
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

      {(window.env?.isWindows ||
        window.env?.isLinux ||
        window.localStorage.getItem('showWindowsTitleBar') === 'true') && (
        <TitleBar />
      )}

      <ContextMenus />

      {/* {window.env?.isElectron && <Airplay />} */}
    </div>
  )
}

export default Layout
