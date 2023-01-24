import { useParams } from 'react-router-dom'
import useArtistMV from '@/web/api/hooks/useArtistMV'
import { useTranslation } from 'react-i18next'
import uiStates from '@/web/states/uiStates'

const ArtistVideos = () => {
  const { t } = useTranslation()
  const params = useParams()
  const { data: videos } = useArtistMV({ id: Number(params.id) || 0 })

  if (!videos?.mvs?.length) return null

  return (
    <div>
      <div className='mb-6 mt-10 text-12 font-medium uppercase text-neutral-300'>
        {t`common.video_other`}
      </div>

      <div className='grid grid-cols-3 gap-6'>
        {videos?.mvs?.slice(0, 6)?.map(video => (
          <div key={video.id} onClick={() => (uiStates.playingVideoID = video.id)}>
            <img
              src={video.imgurl16v9}
              className='aspect-video w-full rounded-24 border border-white/5 object-contain'
            />
            <div className='mt-2 text-12 font-medium text-neutral-600'>{video.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ArtistVideos
