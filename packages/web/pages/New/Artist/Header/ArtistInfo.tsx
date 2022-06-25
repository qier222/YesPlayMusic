import useIsMobile from '@/web/hooks/useIsMobile'

const ArtistInfo = ({ artist }: { artist?: Artist }) => {
  const isMobile = useIsMobile()
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
      {!isMobile && (
        <div className='line-clamp-5 mt-6 text-14 font-bold text-night-400'>
          {artist?.briefDesc}
        </div>
      )}
    </div>
  )
}

export default ArtistInfo
