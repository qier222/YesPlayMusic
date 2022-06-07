import { player } from '@/web/store'
import { css, cx } from '@emotion/css'
import { useSnapshot } from 'valtio'
import Image from '@/web/components/New/Image'
import Icon from '@/web/components/Icon'
import useCoverColor from '@/web/hooks/useCoverColor'
import { resizeImage } from '@/web/utils/common'
import { motion, PanInfo, useMotionValue } from 'framer-motion'

const PlayerMobile = () => {
  const playerSnapshot = useSnapshot(player)
  const bgColor = useCoverColor(playerSnapshot.track?.al?.picUrl ?? '')

  const x = useMotionValue(0)
  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const x = info.offset.x
    const offset = 100
    if (x > offset) player.nextTrack()
    if (x < -offset) player.prevTrack()
  }

  return (
    <div
      className={cx(
        'relative flex h-16 w-full items-center rounded-20 py-2.5 px-3',
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

      <Image
        src={resizeImage(playerSnapshot.track?.al.picUrl || '', 'sm')}
        alt='Cover'
        className='z-10 aspect-square h-full rounded-lg'
      />

      <div className='relative flex-grow overflow-hidden px-3'>
        <motion.div
          drag='x'
          style={{ x }}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          className='line-clamp-1 text-14 font-bold text-white'
        >
          {playerSnapshot.track?.name}
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
