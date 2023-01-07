import Header from './Header'
import Popular from './Popular'
import ArtistAlbum from './ArtistAlbums'
import FansAlsoLike from './FansAlsoLike'
import ArtistVideos from './ArtistVideos'

const Artist = () => {
  return (
    <div>
      <Header />
      {/* Dividing line */}
      <div className='mt-10 mb-7.5 h-px w-full bg-white/20'></div>
      <Popular />
      <ArtistAlbum />
      <ArtistVideos />
      <FansAlsoLike />

      {/* Page padding */}
      <div className='h-16'></div>
    </div>
  )
}

export default Artist
