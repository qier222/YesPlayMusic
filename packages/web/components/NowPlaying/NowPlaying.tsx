import { css, cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import { AnimatePresence, motion } from 'framer-motion'
import ArtistInline from '@/web/components/ArtistsInline'
import persistedUiStates from '@/web/states/persistedUiStates'
import Controls from './Controls'
import Cover from './Cover'
import Progress from './Progress'

const NowPlaying = () => {
  const { track } = useSnapshot(player)
  const { minimizePlayer } = useSnapshot(persistedUiStates)

  return (
    <>
      {/* Now Playing */}
      <AnimatePresence>
        {!minimizePlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cx(
              'relative flex aspect-square h-full w-full flex-col justify-end overflow-hidden rounded-24 border',
              css`
                border-color: hsl(0, 100%, 100%, 0.08);
              `
            )}
          >
            {/* Cover */}
            <Cover />

            {/* Info & Controls */}
            <div className='m-3 flex flex-col items-center rounded-20 bg-white/60 p-5 font-medium backdrop-blur-3xl dark:bg-black/70'>
              {/* Track Info */}
              <div className='line-clamp-1 text-lg text-black dark:text-white'>
                {track?.name}
              </div>
              <ArtistInline
                artists={track?.ar || []}
                className='text-black/30 dark:text-white/30'
                hoverClassName='hover:text-black/50 dark:hover:text-white/70 transition-colors duration-400'
              />

              {/* Dividing line */}
              <div className='mt-2 h-px w-2/5 bg-black/10 dark:bg-white/10'></div>

              {/* Progress */}
              <Progress />

              {/* Controls placeholder */}
              <div className='h-11'></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <Controls />
    </>
  )
}

export default NowPlaying
