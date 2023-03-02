import { css, cx } from '@emotion/css'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import uiStates from '../states/uiStates'
import { resizeImage } from '../utils/common'
import { ease } from '../utils/const'
import Icon from './Icon'

function ArtworkViewer({
  type,
  artwork,
  isOpen,
  onClose,
}: {
  type: 'album' | 'playlist'
  artwork: string
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
            onClick={onClose}
          >
            <div className='relative'>
              <img
                src={resizeImage(artwork, 'lg')}
                className={cx(
                  'rounded-24',
                  css`
                    height: 65vh;
                    width: 65vh;
                  `
                )}
                onClick={e => e.stopPropagation()}
              />

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

export default ArtworkViewer
