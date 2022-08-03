import ArtistRow from '@/web/components/New/ArtistRow'
import useSimilarArtists from '@/web/api/hooks/useSimilarArtists'
import { useParams } from 'react-router-dom'

const FansAlsoLike = () => {
  const params = useParams()
  const { data: artists, isLoading } = useSimilarArtists({
    id: Number(params.id) || 0,
  })

  return (
    <>
      {(isLoading || artists?.artists) && (
        <div>
          <div className='mb-6 mt-10 text-12 font-medium uppercase text-neutral-300'>
            Fans Also Like
          </div>

          <ArtistRow artists={artists?.artists?.slice(0, 5)} />
        </div>
      )}
    </>
  )
}

export default FansAlsoLike
