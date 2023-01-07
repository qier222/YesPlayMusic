import { resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { memo, useEffect } from 'react'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'

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

          {videoCover && <VideoCover source={videoCover} />}
        </div>
      </>
    )
  }
)
Cover.displayName = 'Cover'

export default Cover
