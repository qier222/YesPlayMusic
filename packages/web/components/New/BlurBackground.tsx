import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useIsMobile from '@/web/hooks/useIsMobile'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const BlurBackground = () => {
  const isMobile = useIsMobile()
  const { hideTopbarBackground, blurBackgroundImage } = useSnapshot(uiStates)
  const location = useLocation()
  const animate = useAnimation()

  useEffect(() => {
    uiStates.blurBackgroundImage = null
  }, [location.pathname])

  const onLoad = async () => {
    animate.start({ opacity: 1 })
  }

  return (
    <AnimatePresence>
      {!isMobile && blurBackgroundImage && hideTopbarBackground && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={animate}
          exit={{ opacity: 0 }}
          transition={{ ease }}
          onLoad={onLoad}
          className={cx(
            'absolute z-0 object-cover opacity-70',
            css`
              top: -400px;
              left: -370px;
              width: 1572px;
              height: 528px;
              filter: blur(256px) saturate(1.2);
            `
          )}
          src={resizeImage(blurBackgroundImage, 'sm')}
        />
      )}
    </AnimatePresence>
  )
}

export default BlurBackground
