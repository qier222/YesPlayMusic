import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { injectGlobal } from '@emotion/css'
import { isIOS, isSafari } from '@/web/utils/common'
import { motion } from 'framer-motion'

injectGlobal`
  .plyr__video-wrapper,
  .plyr--video  {
    background-color: transparent !important;
  }
`

const VideoCover = ({
  source,
  onPlay,
}: {
  source?: string
  onPlay?: () => void
}) => {
  const ref = useRef<HTMLVideoElement>(null)
  const hls = useRef<Hls>(new Hls())

  useEffect(() => {
    if (source && Hls.isSupported()) {
      const video = document.querySelector('#video-cover') as HTMLVideoElement
      hls.current.loadSource(source)
      hls.current.attachMedia(video)
    }
  }, [source])

  return (
    <motion.div
      initial={{ opacity: isIOS ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className='absolute inset-0'
    >
      {isSafari ? (
        <video
          src={source}
          className='h-full w-full'
          autoPlay
          loop
          muted
          playsInline
          onPlay={() => onPlay?.()}
        ></video>
      ) : (
        <div className='aspect-square'>
          <video
            id='video-cover'
            ref={ref}
            autoPlay
            muted
            loop
            onPlay={() => onPlay?.()}
          />
        </div>
      )}
    </motion.div>
  )
}

export default VideoCover
