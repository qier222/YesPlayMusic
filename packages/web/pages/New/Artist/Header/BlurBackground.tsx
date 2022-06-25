import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useIsMobile from '@/web/hooks/useIsMobile'

const BlurBackground = ({ cover }: { cover?: string }) => {
  const isMobile = useIsMobile()
  return isMobile || !cover ? (
    <></>
  ) : (
    <img
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
  )
}

export default BlurBackground
