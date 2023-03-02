import useUser from '@/web/api/hooks/useUser'
import Appearance from './Appearance'
import { css, cx } from '@emotion/css'
import { useState } from 'react'
import UserCard from './UserCard'
import { useTranslation } from 'react-i18next'
import { motion, useAnimationControls } from 'framer-motion'
import General from './General'
import Player from './Player'
import PageTransition from '@/web/components/PageTransition'
import { ease } from '@/web/utils/const'

export const categoryIds = ['general', 'appearance', 'player', 'lyrics', 'lab'] as const
export type Category = typeof categoryIds[number]

const Sidebar = ({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: string
  setActiveCategory: (category: Category) => void
}) => {
  const { t } = useTranslation()
  const categories: { name: string; id: Category }[] = [
    { name: t`settings.general`, id: 'general' },
    { name: t`settings.appearance`, id: 'appearance' },
    { name: t`settings.player`, id: 'player' },
    { name: t`settings.lyrics`, id: 'lyrics' },
    { name: t`settings.lab`, id: 'lab' },
  ]
  const animation = useAnimationControls()

  const onClick = (categoryId: Category) => {
    setActiveCategory(categoryId)
    const index = categories.findIndex(category => category.id === categoryId)
    animation.start({ y: index * 40 + 11.5 })
  }

  return (
    <div className='relative'>
      <motion.div
        initial={{ y: 11.5 }}
        animate={animation}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.36 }}
        className='absolute top-0 left-3 mr-2 h-4 w-1 rounded-full bg-brand-700'
      ></motion.div>

      {categories.map(category => (
        <motion.div
          key={category.id}
          onClick={() => onClick(category.id)}
          initial={{ x: activeCategory === category.id ? 12 : 0 }}
          animate={{ x: activeCategory === category.id ? 12 : 0 }}
          className={cx(
            'flex items-center rounded-lg px-3 py-2 font-medium transition-colors duration-500',
            activeCategory === category.id ? 'text-brand-700' : 'text-white/50 hover:text-white/90'
          )}
        >
          {category.name}
        </motion.div>
      ))}
    </div>
  )
}

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('general')
  const { data: user } = useUser()

  const categoriesAndComponents: { id: Category; component: JSX.Element }[] = [
    { id: 'general', component: <General /> },
    { id: 'appearance', component: <Appearance /> },
    { id: 'player', component: <Player /> },
    { id: 'lyrics', component: <span className='text-white'>开发中</span> },
    { id: 'lab', component: <span className='text-white'>开发中</span> },
  ]

  return (
    <PageTransition>
      <div className='mt-6'>
        {user?.profile && <UserCard />}

        <div
          className={cx(
            'mt-8 grid gap-10',
            css`
              grid-template-columns: 11rem auto;
            `
          )}
        >
          <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          {categoriesAndComponents.map(categoryAndComponent => {
            if (categoryAndComponent.id === activeCategory) {
              return (
                <motion.div
                  key={categoryAndComponent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <div key={categoryAndComponent.id}>{categoryAndComponent.component}</div>
                </motion.div>
              )
            }
          })}
        </div>
      </div>
    </PageTransition>
  )
}

export default Settings
