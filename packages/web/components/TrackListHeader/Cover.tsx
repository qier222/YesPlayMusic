import { resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { memo, useEffect, useState } from 'react'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'
import ArtworkViewer from '../ArtworkViewer'
import useSettings from '@/web/hooks/useSettings'

const Cover = memo(({ cover, videoCover }: { cover?: string; videoCover?: string }) => {
  useEffect(() => {
    if (cover) uiStates.blurBackgroundImage = cover
  }, [cover])

  const [isOpenArtworkViewer, setIsOpenArtworkViewer] = useState(false)

  return (
    <>
      <div
        onClick={() => {
          if (cover) setIsOpenArtworkViewer(true)
        }}
        className='relative aspect-square w-full overflow-hidden rounded-24'
      >
        <Image className='absolute inset-0' src={resizeImage(cover || '', 'lg')} />

        {videoCover && <VideoCover source={videoCover} />}
      </div>

      <ArtworkViewer
        type='album'
        artwork={cover || ''}
        isOpen={isOpenArtworkViewer}
        onClose={() => setIsOpenArtworkViewer(false)}
      />
    </>
  )
})
Cover.displayName = 'Cover'

export default Cover
