import { css, cx } from '@emotion/css'
import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'
import NavigationButtons from './NavigationButtons'
import topbarBackground from '@/web/assets/images/topbar-background.png'
import uiStates from '@/web/states/uiStates'
import { useSnapshot } from 'valtio'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useLocation } from 'react-router-dom'

const Background = () => {
  const { hideTopbarBackground } = useSnapshot(uiStates)
  const location = useLocation()
  const isPageHaveBlurBG =
    location.pathname.startsWith('/album/') ||
    location.pathname.startsWith('/artist/') ||
    location.pathname.startsWith('/playlist/')
  const show = !hideTopbarBackground || !isPageHaveBlurBG

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease }}
            className={cx(
              'absolute inset-0 z-0 bg-contain bg-repeat-x',
              window.env?.isElectron && 'rounded-t-24'
            )}
            style={{ backgroundImage: `url(${topbarBackground})` }}
          ></motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const TopbarDesktop = () => {
  return (
    <div
      className={cx(
        'app-region-drag fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-contain pt-11 pb-10 pr-6',
        css`
          padding-left: 144px;
        `
      )}
    >
      {/* Background */}
      <Background />

      {/* Left Part */}
      <div className='z-10 flex items-center'>
        <NavigationButtons />

        {/* Dividing line */}
        <div className='mx-6 h-4 w-px bg-black/20 dark:bg-white/20'></div>

        <SearchBox />
      </div>

      {/* Right Part */}
      <div className='z-10 flex'>
        <SettingsButton />
        <Avatar className='ml-3 h-12 w-12' />
      </div>
    </div>
  )
}

export default TopbarDesktop
