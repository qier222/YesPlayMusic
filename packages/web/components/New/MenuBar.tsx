import React, { useEffect, useState } from 'react'
import { css, cx } from '@emotion/css'
import Icon from '../Icon'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAnimation, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import TrafficLight from './TrafficLight'
import useIsMobile from '@/web/hooks/useIsMobile'

const tabs = [
  {
    name: 'MY MUSIC',
    path: '/',
    icon: 'my',
  },
  {
    name: 'DISCOVER',
    path: '/discover',
    icon: 'explore',
  },
  {
    name: 'BROWSE',
    path: '/browse',
    icon: 'discovery',
  },
  {
    name: 'LYRICS',
    path: '/lyrics',
    icon: 'lyrics',
  },
] as const

const getNameByPath = (path: string): string => {
  return tabs.find(tab => tab.path === path)?.name || ''
}
const TabName = () => {
  const location = useLocation()
  const [name, setName] = useState(getNameByPath(location.pathname))
  const controls = useAnimation()

  useEffect(() => {
    const newName = getNameByPath(location.pathname)
    const animate = async () => {
      await controls.start('out')
      setName(newName)
      await controls.start('in')
    }
    if (newName !== name) animate()
  }, [controls, location.pathname, name])

  return (
    <div
      className={cx(
        'absolute bottom-8 right-0 left-0 z-10 flex rotate-180 select-none items-center font-bold text-brand-600 dark:text-brand-700',
        css`
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 0.02em;
        `
      )}
    >
      <motion.span
        initial='in'
        animate={controls}
        variants={{
          in: { opacity: 1 },
          out: { opacity: 0 },
        }}
        transition={{
          duration: 0.18,
          ease,
        }}
      >
        {name}
      </motion.span>
    </div>
  )
}

const Tabs = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const controls = useAnimation()
  const [active, setActive] = useState<string>(
    location.pathname || tabs[0].path
  )

  const animate = async (path: string) => {
    await controls.start((p: string) =>
      p === path && location.pathname !== path ? 'scale' : 'reset'
    )
    await controls.start('reset')
  }

  return (
    <div className='grid grid-cols-4 justify-items-center text-black/10	dark:text-white/20 lg:grid-cols-1 lg:gap-12'>
      {tabs.map(tab => (
        <motion.div
          key={tab.name}
          animate={controls}
          transition={{ ease, duration: 0.18 }}
          onMouseDown={() => {
            if ('vibrate' in navigator) {
              navigator.vibrate(20)
            }
            animate(tab.path)
          }}
          onClick={() => {
            setActive(tab.path)
            navigate(tab.path)
          }}
          custom={tab.path}
          variants={{
            scale: { scale: 0.8 },
            reset: { scale: 1 },
          }}
          className={cx(
            active === tab.path
              ? 'text-brand-600  dark:text-brand-700'
              : 'lg:hover:text-black lg:dark:hover:text-white'
          )}
        >
          <Icon
            name={tab.icon}
            className={cx(
              'app-region-no-drag h-10 w-10 transition-colors duration-500'
            )}
          />
        </motion.div>
      ))}
    </div>
  )
}

const MenuBar = ({ className }: { className?: string }) => {
  const isMobile = useIsMobile()
  return (
    <div
      className={cx(
        'app-region-drag relative flex h-full w-full flex-col justify-center',
        className,
        css`
          grid-area: menubar;
        `
      )}
    >
      <Tabs />
      {!isMobile && <TabName />}
    </div>
  )
}

export default MenuBar
