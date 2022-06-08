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
  const playerSnapshot = useSnapshot(player)
  const bgColor = useCoverColor(playerSnapshot.track?.al?.picUrl ?? '')
  const [locked, setLocked] = useState(false)

  useLockBodyScroll(locked)

  const x = useMotionValue(0)
  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    console.log(JSON.stringify(info))
    const x = info.offset.x
    const offset = 100
    if (x > offset) player.prevTrack()
    if (x < -offset) player.nextTrack()
    setLocked(false)
  }

  return (
    <div
      className={cx(
        'relative flex h-16 w-full items-center rounded-20 px-3',
        css`
          background-color: ${bgColor.to};
        `
      )}
    >
      <div
        className={cx(
          'absolute -top-2.5 h-1.5 w-10 rounded-full bg-brand-700',
          css`
            left: calc((100% - 40px) / 2);
          `
        )}
      ></div>

      <div className='h-full py-2.5'>
        <Image
          src={resizeImage(playerSnapshot.track?.al.picUrl || '', 'sm')}
          alt='Cover'
          className='z-10 aspect-square h-full rounded-lg'
        />
      </div>

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
              {playerSnapshot.track?.name}
            </div>
            <div className='line-clamp-1 mt-1 text-12 font-bold text-white/60'>
              {playerSnapshot.track?.ar?.map(a => a.name).join(', ')}
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

      <button>
        <Icon name='heart' className='h-7 w-7 text-white/10' />
      </button>

      <button
        onClick={() => player.playOrPause()}
        className='ml-2.5 flex items-center justify-center rounded-full bg-white/20 p-2.5'
      >
        <Icon
          name={playerSnapshot.state === 'playing' ? 'pause' : 'play'}
          className='h-6 w-6 text-white/80'
        />
      </button>
    </div>
  )
}

export default PlayerMobile
