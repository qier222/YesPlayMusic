import { NavLink } from 'react-router-dom'
import SvgIcon from '@/components/SvgIcon'
import { prefetchPlaylist } from '@/hooks/usePlaylist'
import useUser from '@/hooks/useUser'
import useUserPlaylists from '@/hooks/useUserPlaylists'

interface Tab {
  name: string
  icon?: string
  route: string
}
interface PrimaryTab extends Tab {
  icon: string
}

const primaryTabs: PrimaryTab[] = [
  {
    name: 'Home',
    icon: 'home',
    route: '/',
  },
  {
    name: 'Explore',
    icon: 'compass',
    route: '/explore',
  },
  {
    name: 'Library',
    icon: 'music-library',
    route: '/library',
  },
]

const PrimaryTabs = () => {
  return (
    <div>
      <div className="app-region-drag h-14"></div>
      {primaryTabs.map(tab => (
        <NavLink
          key={tab.route}
          to={tab.route}
          className={({ isActive }: { isActive: boolean }) =>
            classNames(
              'btn-hover-animation mx-3 flex cursor-default items-center rounded-lg px-3 py-2 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06] dark:after:bg-white/20',
              !isActive && 'text-gray-700 dark:text-white',
              isActive && 'text-brand-500 '
            )
          }
        >
          <SvgIcon className="mr-3 h-6 w-6" name={tab.icon} />
          <span className="font-semibold">{tab.name}</span>
        </NavLink>
      ))}

      <div className="mx-5 my-2 h-px bg-black opacity-5 dark:bg-white dark:opacity-10"></div>
    </div>
  )
}

const Playlists = () => {
  const { data: user } = useUser()
  const { data: playlists } = useUserPlaylists({
    uid: user?.account?.id ?? 0,
    offset: 0,
  })

  return (
    <div className="mb-16 overflow-auto pb-2">
      {playlists?.playlist?.map(playlist => (
        <NavLink
          key={playlist.id}
          to={`/playlist/${playlist.id}`}
          onMouseOver={() => prefetchPlaylist({ id: playlist.id })}
          className={({ isActive }: { isActive: boolean }) =>
            classNames(
              'btn-hover-animation line-clamp-1 my-px mx-3 flex cursor-default items-center rounded-lg px-3 py-[0.38rem] text-sm text-black opacity-70 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06] dark:text-white dark:after:bg-white/20',
              isActive && 'after:scale-100 after:opacity-100'
            )
          }
        >
          <span className="line-clamp-1">{playlist.name}</span>
        </NavLink>
      ))}
    </div>
  )
}

const Sidebar = () => {
  return (
    <div
      id="sidebar"
      className="grid h-screen max-w-sm grid-rows-[12rem_auto] border-r border-gray-300/10 bg-gray-50 bg-opacity-[.85] dark:border-gray-500/10 dark:bg-gray-900 dark:bg-opacity-80"
    >
      <PrimaryTabs />
      <Playlists />
    </div>
  )
}

export default Sidebar
