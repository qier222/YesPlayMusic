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

const VideoCover = ({ videoCover }: { videoCover?: string }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const hls = useRef<Hls>(new Hls())

  useEffect(() => {
    if (videoCover && Hls.isSupported()) {
      const video = document.querySelector('#video-cover') as HTMLVideoElement
      hls.current.loadSource(videoCover)
      hls.current.attachMedia(video)
    }
  }, [videoCover])

  return (
    <motion.div
      initial={{ opacity: isIOS ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className='absolute inset-0'
    >
      {isSafari ? (
        <video
          src={videoCover}
          className='h-full w-full'
          autoPlay
          loop
          muted
          playsInline
        ></video>
      ) : (
        <div className='aspect-square'>
          <video id='video-cover' ref={ref} autoPlay muted loop />
        </div>
      )}
    </motion.div>
  )
}

export default VideoCover
