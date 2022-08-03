import { useNavigate, useParams } from 'react-router-dom'
import useArtistMV from '@/web/api/hooks/useArtistMV'

const ArtistMVs = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { data: videos } = useArtistMV({ id: Number(params.id) || 0 })

  return (
    <div>
      <div className='mb-6 mt-10 text-12 font-medium uppercase text-neutral-300'>
        MV
      </div>

      <div className='grid grid-cols-3 gap-6'>
        {videos?.mvs?.slice(0, 6)?.map(video => (
          <div key={video.id} onClick={() => navigate(`/mv/${video.id}`)}>
            <img
              src={video.imgurl16v9}
              className='aspect-video w-full rounded-24 object-contain'
            />
            <div className='mt-2 text-12 font-medium text-neutral-600'>
              {video.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ArtistMVs
