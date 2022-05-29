import Player from './Player'
import { player, state } from '@/web/store'
import { getCoverColor } from '@/web/utils/common'
import { colord } from 'colord'
import IconButton from '../IconButton'
import Icon from '../Icon'
import Lyric from './Lyric'
import { motion, AnimatePresence } from 'framer-motion'
import Lyric2 from './Lyric2'
import useCoverColor from '@/web/hooks/useCoverColor'
import { cx } from '@emotion/css'
import { useMemo } from 'react'
import { useSnapshot } from 'valtio'

const LyricPanel = () => {
  const stateSnapshot = useSnapshot(state)
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  const bgColor = useCoverColor(track?.al?.picUrl ?? '')

  return (
    <AnimatePresence>
      {stateSnapshot.uiStates.showLyricPanel && (
        <motion.div
          initial={{
            y: '100%',
          }}
          animate={{
            y: 0,
            transition: {
              ease: 'easeIn',
              duration: 0.4,
            },
          }}
          exit={{
            y: '100%',
            transition: {
              ease: 'easeIn',
              duration: 0.4,
            },
          }}
          className={cx(
            'fixed inset-0 z-40 grid grid-cols-[repeat(13,_minmax(0,_1fr))] gap-[8%]  bg-gray-800'
          )}
          style={{
            background: `linear-gradient(to bottom, ${bgColor.from}, ${bgColor.to})`,
          }}
        >
          {/* Drag area */}
          <div className='app-region-drag absolute top-0 right-0 left-0 h-16'></div>

          <Player className='col-span-6' />
          {/* <Lyric className='col-span-7' /> */}
          <Lyric2 className='col-span-7' />

          <div className='absolute bottom-3.5 right-7 text-white'>
            <IconButton onClick={() => (state.uiStates.showLyricPanel = false)}>
              <Icon className='h-6 w-6' name='lyrics' />
            </IconButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LyricPanel
