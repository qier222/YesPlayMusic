import { css, cx } from '@emotion/css'
import { useLocation } from 'react-router-dom'
import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'
import NavigationButtons from './NavigationButtons'

const TopbarDesktop = () => {
  const location = useLocation()

  return (
    <div
      className={cx(
        'app-region-drag fixed top-0 right-0 z-20 flex items-center justify-between overflow-hidden rounded-tr-24 pt-11 pb-10 pr-6 pl-10 ',
        css`
          left: 104px;
        `,
        !location.pathname.startsWith('/album/') &&
          !location.pathname.startsWith('/playlist/') &&
          'bg-gradient-to-b from-white dark:from-black'
      )}
    >
      {/* Left Part */}
      <div className='flex items-center'>
        <NavigationButtons />

        {/* Dividing line */}
        <div className='mx-6 h-4 w-px bg-black/20 dark:bg-white/20'></div>

        <SearchBox />
      </div>

      {/* Right Part */}
      <div className='flex'>
        <SettingsButton />
        <Avatar className='ml-3 h-12 w-12' />
      </div>
    </div>
  )
}

export default TopbarDesktop
