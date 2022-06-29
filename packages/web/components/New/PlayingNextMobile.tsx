import { css, cx } from '@emotion/css'
import {
  motion,
  useMotionValue,
  useDragControls,
  AnimatePresence,
} from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLockBodyScroll } from 'react-use'
import { isIosPwa } from '@/web/utils/common'
import PlayingNext from './PlayingNext'
import { ease } from '@/web/utils/const'

const PlayingNextMobile = () => {
  const [display, setDisplay] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  useLockBodyScroll(isDragging || display)

  const dragControls = useDragControls()
  const y = useMotionValue('82%')

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 px-3 bg-black/80 backdrop-blur-3xl'
        exit={{
          y: '100%',
          transition: {
            duration: 0.6,
            ease: 'easeOut',
          },
        }}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        style={{
          borderRadius: isDragging ? '24px' : '0px',
          y,
        }}
        drag='y'
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragDirectionLock={true}
        onDrag={(event, info) => console.log(info.point.y)}
      >
        {/* Indictor */}
        <motion.div
          onPointerDown={e => {
            setIsDragging(true)
            dragControls.start(e)
          }}
          onDragEnd={() => setIsDragging(false)}
          dragConstraints={{ top: 0, bottom: 0 }}
          className={cx(
            'mx-7 flex justify-center',
            css`
              --height: 30px;
              bottom: calc(
                70px + 64px +
                  ${isIosPwa ? '24px' : 'env(safe-area-inset-bottom)'}
              ); // 拖动条到导航栏的距离 + 导航栏高度 + safe-area-inset-bottom
              height: var(--height);
            `
          )}
          layout
        >
          <motion.div
            className='mt-3.5 h-1.5 w-10 rounded-full bg-brand-700'
            layout
            style={{ width: isDragging || display ? '80px' : '40px' }}
          ></motion.div>
        </motion.div>

        {/* List */}
        <div className='relative'>
          <PlayingNext />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PlayingNextMobile
