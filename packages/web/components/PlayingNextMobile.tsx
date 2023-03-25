import { css, cx } from '@emotion/css'
import { motion, useDragControls, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useLockBodyScroll } from 'react-use'
import PlayingNext from './PlayingNext'
import { ease } from '@/web/utils/const'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import Icon from '@/web/components/Icon'

const PlayingNextMobile = () => {
  const { mobileShowPlayingNext: display } = useSnapshot(uiStates)
  const [isDragging, setIsDragging] = useState(false)
  useLockBodyScroll(isDragging)

  const dragControls = useDragControls()

  return (
    <AnimatePresence>
      {display && (
        <motion.div
          className='fixed inset-0 bg-black/80 backdrop-blur-3xl'
          exit={{
            y: '100%',
            borderRadius: '24px',
            transition: {
              ease: 'easeOut',
              duration: 0.4,
            },
          }}
          animate={{ y: 0, borderRadius: 0 }}
          initial={{ y: '100%', borderRadius: '24px' }}
          transition={{ duration: 0.6, ease }}
          dragControls={dragControls}
          dragListener={false}
          whileDrag={{
            borderRadius: '24px',
            transition: {
              duration: 0.2,
              ease: 'linear',
            },
          }}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragDirectionLock={true}
          onDragEnd={(event, info) => {
            setIsDragging(false)
            const offset = info.offset.y
            if (offset > 150) {
              uiStates.mobileShowPlayingNext = false
            }
          }}
          drag='y'
        >
          {/* Indictor */}
          <motion.div
            onPointerDown={e => {
              setIsDragging(true)
              dragControls.start(e)
            }}
            onClick={() => {
              uiStates.mobileShowPlayingNext = false
            }}
            className={cx(
              'flex flex-col justify-end',
              css`
                height: 108px;
              `
            )}
          >
            <Icon name='player-handler' className='mb-5 h-2.5 rotate-180 text-brand-700' />
          </motion.div>

          {/* List */}
          <div className='relative h-full px-7'>
            <PlayingNext />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlayingNextMobile
