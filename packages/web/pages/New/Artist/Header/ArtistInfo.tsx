import useIsMobile from '@/web/hooks/useIsMobile'
import useAppleMusicArtist from '@/web/hooks/useAppleMusicArtist'
import { cx, css } from '@emotion/css'

const ArtistInfo = ({ artist }: { artist?: Artist }) => {
  const isMobile = useIsMobile()
  const { data: artistFromApple, isLoading: isLoadingArtistFromApple } =
    useAppleMusicArtist({
      id: artist?.id,
      name: artist?.name,
    })

  return (
    <div>
      <div className='text-28 font-semibold text-white/70 lg:text-32'>
        {artist?.name}
      </div>
      <div className='mt-2.5 text-24 font-medium text-white/40 lg:mt-6'>
        Artist
      </div>
      <div className='mt-1 text-12 font-medium text-white/40'>
        {artist?.musicSize} Tracks · {artist?.albumSize} Albums ·{' '}
        {artist?.mvSize} Videos
      </div>

      {/* Description */}
      {!isMobile && !isLoadingArtistFromApple && (
        <div
          className={cx(
            'line-clamp-5 mt-6 text-14 font-bold text-white/40',
            css`
              height: 86px;
            `
          )}
        >
          {artistFromApple?.attributes?.artistBio || artist?.briefDesc}
        </div>
      )}
    </div>
  )
}

export default ArtistInfo
