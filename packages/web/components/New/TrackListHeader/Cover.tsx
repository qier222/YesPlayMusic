import { isIOS, isSafari, resizeImage } from '@/web/utils/common'
import Image from '@/web/components/New/Image'
import { memo, useEffect } from 'react'
import useVideoCover from '@/web/hooks/useVideoCover'
import { motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import useAppleMusicAlbum from '@/web/hooks/useAppleMusicAlbum'
import uiStates from '@/web/states/uiStates'
import VideoCover from './VideoCover'

const Cover = memo(
  ({ cover, videoCover }: { cover?: string; videoCover?: string }) => {
    useEffect(() => {
      if (cover) uiStates.blurBackgroundImage = cover
    }, [cover])

    return (
      <>
        <div className='relative aspect-square w-full overflow-hidden rounded-24 '>
          <Image
            className='absolute inset-0'
            src={resizeImage(cover || '', 'lg')}
          />

          {videoCover && <VideoCover videoCover={videoCover} />}
        </div>
      </>
    )
  }
)
Cover.displayName = 'Cover'

export default Cover
