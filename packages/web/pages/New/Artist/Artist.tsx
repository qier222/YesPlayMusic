import useArtist from '@/web/api/hooks/useArtist'
import { cx, css } from '@emotion/css'
import { useParams } from 'react-router-dom'
import Header from './Header'
import Popular from './Popular'
import ArtistAlbum from './ArtistAlbums'
import FansAlsoLike from './FansAlsoLike'
import ArtistMVs from './ArtistMVs'

const Artist = () => {
  const params = useParams()

  const { data: artist, isLoading: isLoadingArtist } = useArtist({
    id: Number(params.id) || 0,
  })

  return (
    <div>
      <Header artist={artist?.artist} />

      {/* Dividing line */}
      <div className='mt-10 mb-7.5 h-px w-full bg-white/20'></div>

      <Popular tracks={artist?.hotSongs} />
      <ArtistAlbum />
      <ArtistMVs />
      <FansAlsoLike />

      {/* Page padding */}
      <div className='h-16'></div>
    </div>
  )
}

export default Artist
