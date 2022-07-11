import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useIsMobile from '@/web/hooks/useIsMobile'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'

const BlurBackground = ({ cover }: { cover?: string }) => {
  const isMobile = useIsMobile()
  const { hideTopbarBackground } = useSnapshot(uiStates)

  return (
    <AnimatePresence>
      {!isMobile && cover && hideTopbarBackground && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease }}
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
          src={resizeImage(cover, 'sm')}
        />
      )}
    </AnimatePresence>
  )
}

export default BlurBackground
