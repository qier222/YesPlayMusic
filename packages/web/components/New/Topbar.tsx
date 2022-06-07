import { css, cx } from '@emotion/css'
import { motion, useAnimation } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { ease } from '@/web/utils/const'
import Icon from '../Icon'
import { resizeImage } from '@/web/utils/common'
import useUser from '@/web/api/hooks/useUser'

const NavigationButtons = () => {
  const navigate = useNavigate()
  const controlsBack = useAnimation()
  const controlsForward = useAnimation()
  const transition = { duration: 0.18, ease }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        onMouseDown={async () => {
          await controlsBack.start({ x: -5 })
          await controlsBack.start({ x: 0 })
        }}
        className='app-region-no-drag rounded-full bg-day-600 p-2.5 dark:bg-night-600'
      >
        <motion.div animate={controlsBack} transition={transition}>
          <Icon name='back' className='h-7 w-7 text-neutral-500' />
        </motion.div>
      </button>
      <button
        onClick={async () => {
          navigate(1)
        }}
        onMouseDown={async () => {
          await controlsForward.start({ x: 5 })
          await controlsForward.start({ x: 0 })
        }}
        className='app-region-no-drag ml-2.5 rounded-full bg-day-600 p-2.5 dark:bg-night-600'
      >
        <motion.div animate={controlsForward} transition={transition}>
          <Icon name='forward' className='h-7 w-7 text-neutral-500' />
        </motion.div>
      </button>
    </>
  )
}

const Avatar = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  const { data: user } = useUser()

  const avatarUrl = user?.profile?.avatarUrl
    ? resizeImage(user?.profile?.avatarUrl ?? '', 'sm')
    : ''

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          onClick={() => navigate('/login')}
          className={cx(
            'app-region-no-drag rounded-full',
            className || 'h-12 w-12'
          )}
        />
      ) : (
        <div
          onClick={() => navigate('/login')}
          className={cx(
            'rounded-full bg-day-600 p-2.5 dark:bg-night-600',
            className || 'h-12 w-12'
          )}
        >
          <Icon name='user' className='h-7 w-7 text-neutral-500' />
        </div>
      )}
    </>
  )
}

const Topbar = () => {
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

        {/* Search Box */}
        <div className='app-region-no-drag flex min-w-[284px] items-center rounded-full bg-day-600 p-2.5 text-neutral-500 dark:bg-night-600'>
          <Icon name='search' className='mr-2.5 h-7 w-7' />
          <input
            placeholder='Artist, songs and more'
            className='bg-transparent font-medium  placeholder:text-neutral-500 dark:text-neutral-200'
          />
        </div>
      </div>

      {/* Right Part */}
      <div className='flex'>
        <button className='app-region-no-drag rounded-full bg-day-600 p-2.5 dark:bg-night-600'>
          <Icon name='placeholder' className='h-7 w-7 text-neutral-500' />
        </button>

        <Avatar className='ml-3 h-12 w-12' />
      </div>
    </div>
  )
}

export default Topbar
