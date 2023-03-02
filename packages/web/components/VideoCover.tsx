import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { isIOS, isSafari } from '@/web/utils/common'
import { motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import uiStates from '../states/uiStates'
import useWindowFocus from '../hooks/useWindowFocus'
import useSettings from '../hooks/useSettings'

const VideoCover = ({ source, onPlay }: { source?: string; onPlay?: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hls = useRef<Hls>()
  const windowFocus = useWindowFocus()
  const { playAnimatedArtworkFromApple } = useSettings()

  useEffect(() => {
    if (source && Hls.isSupported() && videoRef.current && playAnimatedArtworkFromApple) {
      if (hls.current) hls.current.destroy()
      hls.current = new Hls()
      hls.current.loadSource(source)
      hls.current.attachMedia(videoRef.current)
    }

    return () => hls.current && hls.current.destroy()
  }, [source])

  // Pause video cover when playing another video
  const { playingVideoID, isPauseVideos } = useSnapshot(uiStates)
  useEffect(() => {
    if (playingVideoID || isPauseVideos || !windowFocus) {
      videoRef?.current?.pause()
    } else {
      videoRef?.current?.play()
    }
  }, [playingVideoID, isPauseVideos, windowFocus])

  return (
    <motion.div
      initial={{ opacity: isIOS ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className='absolute inset-0'
    >
      {isSafari ? (
        <video
          ref={videoRef}
          src={source}
          className='h-full w-full'
          autoPlay
          loop
          muted
          playsInline
          preload='auto'
          onPlay={() => onPlay?.()}
        ></video>
      ) : (
        <div className='aspect-square'>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            preload='auto'
            onPlay={() => onPlay?.()}
            className='h-full w-full'
          />
        </div>
      )}
    </motion.div>
  )
}

export default VideoCover
