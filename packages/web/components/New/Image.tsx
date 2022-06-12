import { css, cx } from '@emotion/css'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ease } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'

const Image = ({
  src,
  srcSet,
  className,
  alt,
  lazyLoad = true,
  sizes,
  placeholder = 'blank',
  onClick,
  onMouseOver,
  animation = true,
}: {
  src?: string
  srcSet?: string
  sizes?: string
  className?: string
  alt: string
  lazyLoad?: boolean
  placeholder?: 'artist' | 'album' | 'playlist' | 'podcast' | 'blank' | false
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLImageElement>) => void
  animation?: boolean
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const animate = useAnimation()
  const isMobile = useIsMobile()
  const isAnimate = animation && !isMobile
  useEffect(() => setError(false), [src])

  const onLoad = async () => {
    setLoaded(true)
    if (isAnimate) animate.start({ opacity: 1 })
  }
  const onError = () => {
    setError(true)
  }

  const hidden = error || !loaded
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
        initial: { opacity: 1 },
        exit: { opacity: 0 },
        transition,
      }
    : {}

  return (
    <div
      className={cx(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {/* Image */}
      <AnimatePresence>
        <motion.img
          alt={alt}
          className='absolute inset-0 h-full w-full'
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          decoding='async'
          loading={lazyLoad ? 'lazy' : undefined}
          onError={onError}
          onLoad={onLoad}
          onClick={onClick}
          onMouseOver={onMouseOver}
          {...motionProps}
        />
      </AnimatePresence>

      {/* Placeholder / Error fallback */}
      <AnimatePresence>
        {hidden && placeholder && (
          <motion.div
            {...placeholderMotionProps}
            className='absolute inset-0 h-full w-full bg-white dark:bg-neutral-800'
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Image
