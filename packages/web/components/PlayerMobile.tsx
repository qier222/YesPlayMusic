import player from '@/web/states/player'
import { css, cx } from '@emotion/css'
import { useSnapshot } from 'valtio'
import Image from '@/web/components/Image'
import Icon from '@/web/components/Icon'
import useCoverColor from '@/web/hooks/useCoverColor'
import { resizeImage } from '@/web/utils/common'
import { motion, PanInfo } from 'framer-motion'
import { useLockBodyScroll } from 'react-use'
import { useState } from 'react'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/api/hooks/useUserLikedTracksIDs'
import uiStates from '@/web/states/uiStates'
import { ease } from '@/web/utils/const'

const LikeButton = () => {
  const { track } = useSnapshot(player)
  const { data: likedIDs } = useUserLikedTracksIDs()

  const isLiked = !!likedIDs?.ids?.find(id => id === track?.id)

  const likeATrack = useMutationLikeATrack()

  return (
    <button
      className='flex h-full items-center'
      onClick={() => track?.id && likeATrack.mutateAsync(track.id)}
    >
      <Icon
        name={isLiked ? 'heart' : 'heart-outline'}
        className='h-7 w-7 text-white/10'
      />
    </button>
  )
}

const PlayerMobile = () => {
  const { track, state } = useSnapshot(player)
  const bgColor = useCoverColor(track?.al?.picUrl ?? '')
  const [locked, setLocked] = useState(false)
  useLockBodyScroll(locked)
  const { mobileShowPlayingNext } = useSnapshot(uiStates)

  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    console.log(JSON.stringify(info))
    const { x, y } = info.offset
    const offset = 100
    if (y > -100) {
      if (x > offset) player.prevTrack()
      if (x < -offset) player.nextTrack()
    }
    setLocked(false)
  }

  return (
    <div
      className={cx(
        'relative z-20 flex h-16 w-full items-center rounded-20 px-3',
        css`
          background-color: ${bgColor.to};
        `
      )}
    >
      {/* Handler */}
      {!mobileShowPlayingNext && (
        <motion.div
          onClick={() => {
            uiStates.mobileShowPlayingNext = true
          }}
          className={cx(
            'absolute right-0 left-0 flex justify-center',
            css`
              --height: 20px;
              height: var(--height);
              top: calc(var(--height) * -1);
            `
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease, duration: 0.2 }}
        >
          <Icon name='player-handler' className='h-2.5 text-brand-700' />
        </motion.div>
      )}

      {/* Cover */}
      <div className='h-full py-2.5'>
        <Image
          src={resizeImage(track?.al.picUrl || '', 'sm')}
          className='z-10 aspect-square h-full rounded-lg'
        />
      </div>

      {/* Track info */}
      <div className='relative flex h-full flex-grow items-center overflow-hidden px-3'>
        <motion.div
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setLocked(true)}
          onDragEnd={onDragEnd}
          dragDirectionLock={true}
          className='flex h-full flex-grow items-center '
        >
          <div className='flex-shrink-0'>
            <div className='line-clamp-1 text-14 font-bold text-white'>
              {track?.name}
            </div>
            <div className='line-clamp-1 mt-1 text-12 font-bold text-white/60'>
              {track?.ar?.map(a => a.name).join(', ')}
            </div>
          </div>
          <div className='h-full flex-grow'></div>
        </motion.div>

        <div
          className={cx(
            'absolute left-0 top-0 bottom-0 w-3 ',
            css`
              background: linear-gradient(to right, ${bgColor.to}, transparent);
            `
          )}
        ></div>
        <div
          className={cx(
            'absolute right-0  top-0 bottom-0 w-3 bg-red-200',
            css`
              background: linear-gradient(to left, ${bgColor.to}, transparent);
            `
          )}
        ></div>
      </div>

      {/* Like */}
      <LikeButton />

      {/* Play or pause */}
      <button
        onClick={() => player.playOrPause()}
        className='ml-2.5 flex items-center justify-center rounded-full bg-white/20 p-2.5'
      >
        <Icon
          name={state === 'playing' ? 'pause' : 'play'}
          className='h-6 w-6 text-white/80'
        />
      </button>
    </div>
  )
}

export default PlayerMobile
