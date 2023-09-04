import { css, cx } from '@emotion/css'
import persistedUiStates from '@/web/states/persistedUiStates'
import { useSnapshot } from 'valtio'
import NowPlaying from './NowPlaying'
import PlayingNext from './PlayingNext'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { ease } from '@/web/utils/const'

const Player = () => {
  const { minimizePlayer } = useSnapshot(persistedUiStates)

  return (
    <MotionConfig transition={{ duration: 0.6 }}>
      <div
        className={cx(
          'fixed bottom-6 right-6 flex w-full flex-col justify-between overflow-hidden',
          css`
            width: 318px;
          `
        )}
      >
        <AnimatePresence>
          {!minimizePlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease, duration: 0.4 }}
            >
              <PlayingNext />
            </motion.div>
          )}
        </AnimatePresence>

        <NowPlaying />
      </div>
    </MotionConfig>
  )
}

export default Player
