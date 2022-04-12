import { NavLink } from 'react-router-dom'
import SvgIcon from './SvgIcon'
import useUserPlaylists from '@/renderer/hooks/useUserPlaylists'
import { scrollToTop } from '@/renderer/utils/common'
import { prefetchPlaylist } from '@/renderer/hooks/usePlaylist'
import { player } from '@/renderer/store'
import { Mode } from '@/renderer/utils/player'


const primaryTabs = [
  {
    name: '主页',
    icon: 'home',
    route: '/',
  },
  {
    name: '播客',
    icon: 'podcast',
    route: '/podcast',
  },
  {
    name: '音乐库',
    icon: 'music-library',
    route: '/library',
  },
] as const

const PrimaryTabs = () => {
  return (
    <div>
      <div
        className={classNames(window.env?.isMac && 'app-region-drag', 'h-14')}
      ></div>
      {primaryTabs.map(tab => (
        <NavLink
          onClick={() => scrollToTop()}
          key={tab.route}
          to={tab.route}
          className={({ isActive }) =>
            classNames(
              'btn-hover-animation mx-3 flex cursor-default items-center rounded-lg px-3 py-2 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06] dark:after:bg-white/20',
              !isActive && 'text-gray-700 dark:text-white',
              isActive && 'text-brand-500 '
            )
          }
        >
          <SvgIcon className='mr-3 h-6 w-6' name={tab['icon']} />
          <span className='font-semibold'>{tab.name}</span>
        </NavLink>
      ))}

      <div className='mx-5 my-2 h-px bg-black opacity-5 dark:bg-white dark:opacity-10'></div>
    </div>
  )
}

const Playlists = () => {
  const { data: playlists } = useUserPlaylists()
  const playerSnapshot = useSnapshot(player)
  const currentPlaylistID = useMemo(() => playerSnapshot.trackListSource?.id, [playerSnapshot.trackListSource])
  const mode = useMemo(() => playerSnapshot.mode, [playerSnapshot.mode])

  const playOrPause = () => {
    player.playOrPause()
  }

  return (
    <div className='mb-16 overflow-auto pb-2'>
      {playlists?.playlist?.map(playlist => (
        <NavLink
          onMouseOver={() => prefetchPlaylist({ id: playlist.id })}
          key={playlist.id}
          onClick={() => scrollToTop()}
          to={`/playlist/${playlist.id}`}
          className={({ isActive }: { isActive: boolean }) =>
            classNames(
              'btn-hover-animation line-clamp-1 my-px mx-3 flex cursor-default items-center rounded-lg px-3 py-[0.38rem] text-sm text-black opacity-70 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06] dark:text-white dark:after:bg-white/20',
              isActive && 'after:scale-100 after:opacity-100'
            )
          }
          style={{ justifyContent: 'space-between' }}
        >
          <span className='line-clamp-1'>{playlist.name}</span>
          {mode == Mode.PLAYLIST && currentPlaylistID == playlist.id
            &&
           <SvgIcon className='h-5 w-5' name="volume-half" />}
        </NavLink>
      ))}
    </div>
  )
}

const Sidebar = () => {
  return (
    <div
      id='sidebar'
      className='grid h-screen max-w-sm grid-rows-[12rem_auto] border-r border-gray-300/10 bg-gray-50 bg-opacity-[.85] dark:border-gray-500/10 dark:bg-gray-900 dark:bg-opacity-80'
    >
      <PrimaryTabs />
      <Playlists />
    </div>
  )
}

export default Sidebar
