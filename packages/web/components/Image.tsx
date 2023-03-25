import { css, cx } from '@emotion/css'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ease } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'

type Props = {
  src?: string
  srcSet?: string
  sizes?: string
  className?: string
  lazyLoad?: boolean
  placeholder?: 'artist' | 'album' | 'playlist' | 'podcast' | 'blank' | false
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLImageElement>) => void
  animation?: boolean
}

const ImageDesktop = ({
  src,
  srcSet,
  className,
  lazyLoad = true,
  sizes,
  placeholder = 'blank',
  onClick,
  onMouseOver,
  animation = true,
}: Props) => {
  const [error, setError] = useState(false)
  const animate = useAnimation()
  const placeholderAnimate = useAnimation()
  const isMobile = useIsMobile()
  const isAnimate = animation && !isMobile
  useEffect(() => setError(false), [src])

  const onLoad = async () => {
    if (isAnimate) {
      animate.start({ opacity: 1 })
      placeholderAnimate.start({ opacity: 0 })
    }
  }
  const onError = () => {
    setError(true)
  }

  const transition = { duration: 0.6, ease }
  const motionProps = isAnimate
    ? {
        animate,
        initial: { opacity: 0 },
        exit: { opacity: 0 },
        transition,
      }
    : {}
  const placeholderMotionProps = isAnimate
    ? {
        animate: placeholderAnimate,
        initial: { opacity: 1 },
        exit: { opacity: 0 },
        transition,
      }
    : {}

  return (
    <div
      onClick={onClick}
      onMouseOver={onMouseOver}
      className={cx(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {/* Image */}
      <AnimatePresence>
        <motion.img
          className='absolute inset-0 h-full w-full'
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          decoding='async'
          loading={lazyLoad ? 'lazy' : undefined}
          onError={onError}
          onLoad={onLoad}
          {...motionProps}
        />
      </AnimatePresence>

      {/* Placeholder / Error fallback */}
      <AnimatePresence>
        {placeholder && (
          <motion.div
            {...placeholderMotionProps}
            className='absolute inset-0 h-full w-full bg-white dark:bg-white/10'
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ImageMobile = (props: Props) => {
  const { src, className, srcSet, sizes, lazyLoad, onClick, onMouseOver } = props
  return (
    <div
      onClick={onClick}
      onMouseOver={onMouseOver}
      className={cx(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {src && (
        <img
          className='absolute inset-0 h-full w-full'
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          decoding='async'
          loading={lazyLoad ? 'lazy' : undefined}
        />
      )}
    </div>
  )
}

const Image = (props: Props) => {
  const isMobile = useIsMobile()
  return isMobile ? <ImageMobile {...props} /> : <ImageDesktop {...props} />
}

export default Image
