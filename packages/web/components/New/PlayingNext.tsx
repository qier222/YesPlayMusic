import { resizeImage } from '@/web/utils/common'
import { player } from '@/web/store'
import { State as PlayerState } from '@/web/utils/player'
import { useSnapshot } from 'valtio'
import useTracks from '@/web/api/hooks/useTracks'
import { css, cx } from '@emotion/css'
import { AnimatePresence, motion } from 'framer-motion'
import Image from './Image'
import Wave from './Wave'
import Icon from '@/web/components/Icon'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { useWindowSize } from 'react-use'
import { playerWidth, topbarHeight } from '@/web/utils/const'

const Header = () => {
  return (
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
  )
}

const Track = ({
  track,
  index,
  playingTrackIndex,
  state,
}: {
  track?: Track
  index: number
  playingTrackIndex: number
  state: PlayerState
}) => {
  return (
    <motion.div
      className='flex items-center justify-between'
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{ x: '100%', opacity: 0 }}
      // transition={{
      //   duration: 0.24,
      // }}
      // layout
      onClick={e => {
        if (e.detail === 2 && track?.id) player.playTrack(track.id)
      }}
    >
      {/* Cover */}
      <Image
        alt='Cover'
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
        animation={false}
        placeholder={false}
      />

      {/* Track info */}
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium ',
            playingTrackIndex === index
              ? 'text-brand-700'
              : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200  dark:text-neutral-700'>
          {track?.ar.map(a => a.name).join(', ')}
        </div>
      </div>

      {/* Wave icon */}
      {playingTrackIndex === index ? (
        <Wave playing={state === 'playing'} />
      ) : (
        <div className='text-16 font-medium text-neutral-700 dark:text-neutral-200'>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}
    </motion.div>
  )
}

const TrackList = ({ className }: { className?: string }) => {
  const { trackList, trackIndex, state } = useSnapshot(player)
  const { data: tracksRaw } = useTracks({ ids: trackList })
  const tracks = tracksRaw?.songs || []
  const parentRef = useRef<HTMLDivElement>(null)
  const { height } = useWindowSize()

  const listHeight = height - topbarHeight - playerWidth - 24 - 20 // 24是封面与底部间距，20是list与封面间距

  const rowVirtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 5,
  })

  return (
    <>
      <div
        ref={parentRef}
        style={{
          height: `${listHeight}px`,
        }}
        className={cx(
          'no-scrollbar relative z-10 w-full overflow-auto',
          className,
          css`
            padding-top: 42px;
            mask-image: linear-gradient(
              to bottom,
              transparent 0,
              black 42px
            ); // 顶部渐变遮罩
          `
        )}
      >
        <div
          className='relative w-full'
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((row: any) => (
            <div
              key={row.index}
              className='absolute top-0 left-0 w-full'
              style={{
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}
            >
              <Track
                track={tracks?.[row.index]}
                index={row.index}
                playingTrackIndex={trackIndex}
                state={state}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div
        className='pointer-events-none absolute right-0 left-0 z-20 h-14 bg-gradient-to-t from-black to-transparent'
        style={{ top: `${listHeight - 56}px` }}
      ></div>
    </>
  )
}

const PlayingNext = ({ className }: { className?: string }) => {
  return (
    <>
      <Header />
      <TrackList className={className} />
    </>
  )
}

export default PlayingNext
