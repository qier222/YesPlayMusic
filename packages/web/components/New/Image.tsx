import { css, cx } from '@emotion/css'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ease } from '@/web/utils/const'

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
}: {
  src?: string
  srcSet?: string
  sizes?: string
  className?: string
  alt: string
  lazyLoad?: boolean
  placeholder?: 'artist' | 'album' | 'playlist' | 'podcast' | 'blank' | null
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLImageElement>) => void
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const animate = useAnimation()
  const placeholderAnimate = useAnimation()
  const transition = { duration: 0.6, ease }

  useEffect(() => setError(false), [src])

  const onload = async () => {
    setLoaded(true)
    animate.start({ opacity: 1 })
  }
  const onError = () => {
    setError(true)
  }

  const hidden = error || !loaded

  return (
    <div className={cx('relative overflow-hidden', className)}>
      {/* Image */}
      <motion.img
        alt={alt}
        className={cx('absolute inset-0 h-full w-full')}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        decoding='async'
        loading={lazyLoad ? 'lazy' : undefined}
        onLoad={onload}
        onError={onError}
        animate={animate}
        initial={{ opacity: 0 }}
        transition={transition}
        onClick={onClick}
        onMouseOver={onMouseOver}
      />

      {/* Placeholder / Error fallback */}
      <AnimatePresence>
        {hidden && placeholder && (
          <motion.div
            animate={placeholderAnimate}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className='absolute inset-0 h-full w-full bg-white dark:bg-neutral-800'
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Image
