import { isIOS, isSafari, resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { cx, css } from '@emotion/css'
import useAppleMusicArtist from '@/web/hooks/useAppleMusicArtist'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { motion } from 'framer-motion'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'

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
          'relative overflow-hidden lg:rounded-24',
          css`
            grid-area: cover;
          `
        )}
      >
        <Image
          className={cx(
            'aspect-square h-full w-full  lg:z-10',
            video ? 'opacity-0' : 'opacity-100'
          )}
          src={resizeImage(
            isLoadingArtistFromApple
              ? ''
              : artistFromApple?.attributes?.artwork?.url ||
                  artist?.img1v1Url ||
                  '',
            'lg'
          )}
        />

        {video && <VideoCover source={video} />}
      </div>
    </>
  )
}

export default Cover
