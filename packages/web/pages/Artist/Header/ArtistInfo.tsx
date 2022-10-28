import useIsMobile from '@/web/hooks/useIsMobile'
import useAppleMusicArtist from '@/web/hooks/useAppleMusicArtist'
import { cx, css } from '@emotion/css'
import { useTranslation } from 'react-i18next'

const ArtistInfo = ({
  artist,
  isLoading,
}: {
  artist?: Artist
  isLoading: boolean
}) => {
  const { t } = useTranslation()

  const isMobile = useIsMobile()
  const { data: artistFromApple, isLoading: isLoadingArtistFromApple } =
    useAppleMusicArtist({
      id: artist?.id,
      name: artist?.name,
    })

  return (
    <div>
      {/* Name */}
      {isLoading ? (
        <div className=' text-28 font-semibold text-transparent lg:text-32'>
          <span className='rounded-full bg-white/10'>PLACEHOLDER</span>
        </div>
      ) : (
        <div className='text-28 font-semibold text-white/70 lg:text-32'>
          {artist?.name}
        </div>
      )}

      {/* Type */}
      {isLoading ? (
        <div className='mt-2.5 text-24 font-medium text-transparent lg:mt-6'>
          <span className='rounded-full bg-white/10'>Artist</span>
        </div>
      ) : (
        <div className='mt-2.5 text-24 font-medium text-white/40 lg:mt-6'>
          Artist
        </div>
      )}

      {/* Counts */}
      {isLoading ? (
        <div className='mt-1 text-12 font-medium text-transparent'>
          <span className='rounded-full bg-white/10'>PLACEHOLDER12345</span>
        </div>
      ) : (
        <div className='mt-1 text-12 font-medium text-white/40'>
          {t('common.track-with-count', { count: artist?.musicSize })} ·{' '}
          {t('common.album-with-count', { count: artist?.albumSize })} ·{' '}
          {t('common.video-with-count', { count: artist?.mvSize })}
        </div>
      )}

      {/* Description */}
      {!isMobile &&
        (isLoading || isLoadingArtistFromApple ? (
          <div
            className={cx(
              'line-clamp-5 mt-6 text-14 font-bold text-transparent',
              css`
                height: 86px;
              `
            )}
          >
            <span className='rounded-full bg-white/10'>
              PLACEHOLDER1234567890
            </span>
          </div>
        ) : (
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
        ))}
    </div>
  )
}

export default ArtistInfo
