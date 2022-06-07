import { resizeImage } from '@/web/utils/common'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import useTracks from '@/web/api/hooks/useTracks'
import { css, cx } from '@emotion/css'
import { AnimatePresence, motion } from 'framer-motion'
import Image from './Image'
import Wave from './Wave'
import Icon from '@/web/components/Icon'

const PlayingNext = ({ className }: { className?: string }) => {
  const playerSnapshot = useSnapshot(player)
  const { data: tracks } = useTracks({ ids: playerSnapshot.trackList })

  return (
    <>
      <div
        className={cx(
          'absolute top-0 left-0 z-10 flex w-full items-center justify-between px-4 pb-6 text-14 font-bold text-neutral-700 dark:text-neutral-300'
        )}
      >
        <div className='flex'>
          <div className='mr-2 h-4 w-1 bg-brand-700'></div>
          PLAYING NEXT
        </div>
        <div className='flex'>
          <div className='mr-2'>
            <Icon name='repeat-1' className='h-7 w-7 opacity-40' />
          </div>
          <div className='mr-1'>
            <Icon name='shuffle' className='h-7 w-7 opacity-40' />
          </div>
        </div>
      </div>

      <div
        className={cx(
          'no-scrollbar relative z-10 overflow-scroll',
          className,
          css`
            padding-top: 42px;
            mask-image: linear-gradient(to bottom, transparent 0, black 42px);
          `
        )}
      >
        <motion.div className='grid gap-4'>
          <AnimatePresence>
            {tracks?.songs?.map((track, index) => (
              <motion.div
                className='flex items-center justify-between'
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{
                  duration: 0.24,
                }}
                layout
                onClick={e => {
                  if (e.detail === 2) player.playTrack(track.id)
                }}
              >
                {/* Cover */}
                <Image
                  alt='Cover'
                  className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
                  src={resizeImage(track.al.picUrl, 'sm')}
                />

                {/* Track info */}
                <div className='mr-3 flex-grow'>
                  <div
                    className={cx(
                      'line-clamp-1 text-16 font-medium ',
                      playerSnapshot.trackIndex === index
                        ? 'text-brand-700'
                        : 'text-neutral-700 dark:text-neutral-200'
                    )}
                  >
                    {track.name}
                  </div>
                  <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200  dark:text-neutral-700'>
                    {track.ar.map(a => a.name).join(', ')}
                  </div>
                </div>

                {/* Wave icon */}
                {playerSnapshot.trackIndex === index ? (
                  <Wave playing={playerSnapshot.state === 'playing'} />
                ) : (
                  <div className='text-16 font-medium text-neutral-700 dark:text-neutral-200'>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                )}
              </motion.div>
            ))}

            {(tracks?.songs?.length || 0) >= 4 && (
              <div className='pointer-events-none sticky bottom-0 h-8 w-full bg-gradient-to-t from-black'></div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}

export default PlayingNext
