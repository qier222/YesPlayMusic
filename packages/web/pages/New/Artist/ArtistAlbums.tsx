import useArtistAlbums from '@/web/api/hooks/useArtistAlbums'
import CoverRow from '@/web/components/New/CoverRow'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

const ArtistAlbum = () => {
  const params = useParams()

  const { data: albumsRaw, isLoading: isLoadingAlbums } = useArtistAlbums({
    id: Number(params.id) || 0,
    limit: 1000,
  })

  const albums = useMemo(() => albumsRaw?.hotAlbums, [albumsRaw?.hotAlbums])

  return (
    <div>
      <div className='mb-4 mt-11 text-12 font-medium uppercase text-neutral-300'>
        Albums
      </div>

      <CoverRow albums={albums?.slice(0, 12)} />
    </div>
  )
}

export default ArtistAlbum
