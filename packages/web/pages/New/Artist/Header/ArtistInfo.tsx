import useIsMobile from '@/web/hooks/useIsMobile'
import useAppleMusicArtist from '@/web/hooks/useAppleMusicArtist'

const ArtistInfo = ({ artist }: { artist?: Artist }) => {
  const isMobile = useIsMobile()
  const { data: artistFromApple, isLoading: isLoadingArtistFromApple } =
    useAppleMusicArtist({
      id: artist?.id,
      name: artist?.name,
    })

  return (
    <div>
      <div className='text-28 font-semibold text-night-50 lg:text-32'>
        {artist?.name}
      </div>
      <div className='mt-2.5 text-24 font-medium text-night-400 lg:mt-6'>
        Artist
      </div>
      <div className='mt-1 text-12 font-medium text-night-400'>
        {artist?.musicSize} Tracks · {artist?.albumSize} Albums ·{' '}
        {artist?.mvSize} Videos
      </div>

      {/* Description */}
      {!isMobile && !isLoadingArtistFromApple && (
        <div className='line-clamp-5 mt-6 text-14 font-bold text-night-400'>
          {artistFromApple?.attributes?.artistBio || artist?.briefDesc}
        </div>
      )}
    </div>
  )
}

export default ArtistInfo
