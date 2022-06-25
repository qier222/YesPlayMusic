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

const PlayerMobile = () => {
  const { track, state } = useSnapshot(player)
  const bgColor = useCoverColor(track?.al?.picUrl ?? '')
  const [locked, setLocked] = useState(false)

  useLockBodyScroll(locked)

  const x = useMotionValue(0)
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

  const y = useMotionValue(0)

  return (
    <div
      className={cx(
        'relative z-20 flex h-16 w-full items-center rounded-20 px-3',
        css`
          background-color: ${bgColor.to};
        `
      )}
    >
      {/* Indictor */}
      <motion.div
        drag='y'
        dragConstraints={{ top: 0, bottom: 0 }}
        style={{ y: y.get() * 2 }}
        className={cx(
          'absolute flex items-center justify-center',
          css`
            --width: 60px;
            --height: 26px;
            left: calc((100% - var(--width)) / 2);
            top: calc(var(--height) * -1);
            height: var(--height);
            width: var(--width);
          `
        )}
      >
        <div className='h-1.5 w-10 rounded-full bg-brand-700'></div>
      </motion.div>

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
          style={{ x }}
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setLocked(true)}
          onDragEnd={onDragEnd}
          className=' flex h-full flex-grow items-center '
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
      <button>
        <Icon name='heart' className='h-7 w-7 text-white/10' />
      </button>

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
