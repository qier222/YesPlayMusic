import { player } from '@/web/store'
import { css, cx } from '@emotion/css'
import { useSnapshot } from 'valtio'
import Image from '@/web/components/New/Image'
import Icon from '@/web/components/Icon'
import useCoverColor from '@/web/hooks/useCoverColor'
import { resizeImage } from '@/web/utils/common'
import { motion, PanInfo, useMotionValue } from 'framer-motion'
import { useLockBodyScroll } from 'react-use'
import { useState } from 'react'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/api/hooks/useUserLikedTracksIDs'
import PlayingNextMobile from './PlayingNextMobile'

const LikeButton = () => {
  const { track } = useSnapshot(player)
  const { data: likedIDs } = useUserLikedTracksIDs()

  const isLiked = !!likedIDs?.ids?.find(id => id === track?.id)

  const likeATrack = useMutationLikeATrack()

  return (
    <button
      className='flex items-center h-full'
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
      {/* Cover */}

      <div className='h-full py-2.5'>
        <Image
          src={resizeImage(track?.al.picUrl || '', 'sm')}
          className='z-10 h-full rounded-lg aspect-square'
        />
      </div>

      {/* Track info */}
      <div className='relative flex items-center flex-grow h-full px-3 overflow-hidden'>
        <motion.div
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setLocked(true)}
          onDragEnd={onDragEnd}
          className='flex items-center flex-grow h-full '
        >
          <div className='flex-shrink-0'>
            <div className='font-bold text-white line-clamp-1 text-14'>
              {track?.name}
            </div>
            <div className='mt-1 font-bold line-clamp-1 text-12 text-white/60'>
              {track?.ar?.map(a => a.name).join(', ')}
            </div>
          </div>
          <div className='flex-grow h-full'></div>
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
          className='w-6 h-6 text-white/80'
        />
      </button>
    </div>
  )
}

export default PlayerMobile
