import { isIOS, isSafari, resizeImage } from '@/web/utils/common'
import Image from '@/web/components/New/Image'
import { cx, css } from '@emotion/css'
import useAppleMusicArtist from '@/web/hooks/useAppleMusicArtist'
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { motion } from 'framer-motion'
import uiStates from '@/web/states/uiStates'

const VideoCover = ({ source }: { source?: string }) => {
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
    <div className='z-10 aspect-square overflow-hidden rounded-24'>
      <video
        id='video-cover'
        className='h-full w-full'
        ref={ref}
        autoPlay
        muted
        loop
      />
    </div>
  )
}

const Cover = ({ artist }: { artist?: Artist }) => {
  const { data: artistFromApple, isLoading: isLoadingArtistFromApple } =
    useAppleMusicArtist({
      id: artist?.id,
      name: artist?.name,
    })

  const video =
    artistFromApple?.attributes?.editorialVideo?.motionArtistSquare1x1?.video
  const cover = isLoadingArtistFromApple
    ? ''
    : artistFromApple?.attributes?.artwork?.url || artist?.img1v1Url

  useEffect(() => {
    if (cover) uiStates.blurBackgroundImage = cover
  }, [cover])

  return (
    <>
      <div
        className={cx(
          'relative',
          css`
            grid-area: cover;
          `
        )}
      >
        <Image
          className='aspect-square h-full w-full lg:z-10 lg:rounded-24'
          src={resizeImage(
            isLoadingArtistFromApple
              ? ''
              : artistFromApple?.attributes?.artwork?.url ||
                  artist?.img1v1Url ||
                  '',
            'lg'
          )}
        />

        {video && (
          <motion.div
            initial={{ opacity: isIOS ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='absolute inset-0 z-10 h-full w-full'
          >
            {isSafari ? (
              <video
                src={video}
                className='h-full w-full'
                autoPlay
                loop
                muted
                playsInline
              ></video>
            ) : (
              <VideoCover source={video} />
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}

export default Cover
