import { css, cx } from '@emotion/css'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import uiStates from '../states/uiStates'
import { ease } from '../utils/const'
import Icon from './Icon'

function DescriptionViewer({
  description,
  title,
  isOpen,
  onClose,
}: {
  description: string
  title: string
  isOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    uiStates.isPauseVideos = isOpen
  }, [isOpen])

  return createPortal(
    <>
      {/* Blur bg */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-30 bg-black/70 backdrop-blur-3xl lg:rounded-24'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.3 } }}
            transition={{ ease }}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ ease }}
            className={cx('fixed inset-0 z-30 flex flex-col items-center justify-center')}
          >
            <div className='relative'>
              {/* Title */}
              <div className='line-clamp-1 absolute -top-8 mx-44 max-w-2xl select-none text-32 font-extrabold text-neutral-100'>
                {title}
              </div>

              {/* Description */}

              <div
                className={css`
                  mask-image: linear-gradient(to top, transparent 0px, black 32px); // 底部渐变遮罩
                `}
              >
                <div
                  className={cx(
                    'no-scrollbar relative mx-44 max-w-2xl overflow-scroll',
                    css`
                      max-height: 60vh;
                      mask-image: linear-gradient(
                        to bottom,
                        transparent 12px,
                        black 32px
                      ); // 顶部渐变遮罩
                    `
                  )}
                >
                  <p
                    dangerouslySetInnerHTML={{ __html: description + description }}
                    className='mt-8 whitespace-pre-wrap pb-8 text-16 font-bold leading-6 text-neutral-200'
                  ></p>
                </div>
              </div>

              {/* Close button */}
              <div className='absolute -bottom-24 flex w-full justify-center'>
                <div
                  onClick={onClose}
                  className='flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors duration-300 hover:bg-white/20 hover:text-white/70'
                >
                  <Icon name='x' className='h-6 w-6' />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

export default DescriptionViewer
