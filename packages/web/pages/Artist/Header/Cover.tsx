import { resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { cx, css } from '@emotion/css'
import useAppleMusicArtist from '@/web/api/hooks/useAppleMusicArtist'
import { useEffect } from 'react'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'

const Cover = ({ artist }: { artist?: Artist }) => {
  const { data: artistFromApple, isLoading: isLoadingArtistFromApple } = useAppleMusicArtist(
    artist?.id || 0
  )

  const video = artistFromApple?.editorialVideo
  const cover = isLoadingArtistFromApple ? '' : artistFromApple?.artwork || artist?.img1v1Url || ''

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
          src={resizeImage(isLoadingArtistFromApple ? '' : cover, 'lg')}
        />

        {video && <VideoCover source={video} />}
      </div>
    </>
  )
}

export default Cover
