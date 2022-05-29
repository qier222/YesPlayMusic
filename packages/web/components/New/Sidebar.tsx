import React, { useEffect, useState } from 'react'
import { css, cx } from '@emotion/css'
import Icon from '../Icon'
import { NavLink, useLocation } from 'react-router-dom'
import { useAnimation, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'

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

const Sidebar = () => {
  const location = useLocation()

  return (
    <div
      className={cx(
        'app-region-drag relative flex h-full w-full flex-col justify-center',
        css`
          grid-area: sidebar;
        `
      )}
    >
      <div className='grid grid-cols-1 justify-items-center	 gap-12 text-black/10 dark:text-white/20'>
        {tabs.map(tab => (
          <NavLink key={tab.name} to={tab.path}>
            <Icon
              name={tab.icon}
              className={cx(
                'app-region-no-drag h-10 w-10 transition duration-500 active:scale-75',
                location.pathname === tab.path
                  ? 'text-brand-600  dark:text-brand-700'
                  : 'hover:text-black dark:hover:text-white'
              )}
            />
          </NavLink>
        ))}
      </div>
      <TabName />
    </div>
  )
}

export default Sidebar
