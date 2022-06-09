import { formatDate, formatDuration, resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import Image from './Image'
import useIsMobile from '@/web/hooks/useIsMobile'

const TrackListHeader = ({
  album,
  playlist,
  onPlay,
}: {
  album?: Album
  playlist?: Playlist
  onPlay: () => void
}) => {
  const albumDuration = useMemo(() => {
    const duration = album?.songs?.reduce((acc, cur) => acc + cur.dt, 0) || 0
    return formatDuration(duration, 'en', 'hh[hr] mm[min]')
  }, [album?.songs])
  const isMobile = useIsMobile()

  const cover = album?.picUrl || playlist?.coverImgUrl || ''

  return (
    <div
      className={cx(
        'mx-2.5 rounded-48 p-8 dark:bg-white/10',
        'lg:mx-0 lg:grid lg:grid-rows-1 lg:gap-10 lg:rounded-none lg:p-0 lg:dark:bg-transparent',
        !isMobile &&
          css`
            grid-template-columns: 318px auto;
          `
      )}
    >
      {/* Cover */}
      <Image
        className='z-10 aspect-square w-full rounded-24'
        src={resizeImage(cover, 'lg')}
        alt='Cover'
      />

      {/* Blur bg */}
      {!isMobile && (
        <img
          className={cx(
            'absolute z-0 object-cover opacity-70',
            css`
              top: -400px;
              left: -370px;
              width: 1572px;
              height: 528px;
              filter: blur(256px) saturate(1.2);
            `
          )}
          src={resizeImage(cover, 'sm')}
        />
      )}

      <div className='flex flex-col justify-between'>
        <div>
          {/* Name */}
          <div className='mt-2.5 text-28 font-semibold dark:text-night-50 lg:mt-0 lg:text-36 lg:font-medium'>
            {album?.name || playlist?.name}
          </div>

          {/* Creator */}
          <div className='mt-2.5 text-24 font-medium dark:text-night-400 lg:mt-6'>
            {album?.artist.name || playlist?.creator.nickname}
          </div>

          {/* Extra info */}
          <div className='mt-1 flex items-center text-12 font-medium dark:text-night-400 lg:text-14 lg:font-bold'>
            {/* Album info  */}
            {!!album && (
              <>
                {album?.mark === 1056768 && (
                  <Icon
                    name='explicit'
                    className='mb-px mr-1 h-3 w-3 lg:h-3.5 lg:w-3.5 '
                  />
                )}{' '}
                {dayjs(album?.publishTime || 0).year()} · {album?.songs.length}{' '}
                tracks, {albumDuration}
              </>
            )}

            {/* Playlist info */}
            {!!playlist && (
              <>
                Updated at {formatDate(playlist?.updateTime || 0, 'en')} ·{' '}
                {playlist.trackCount} tracks
              </>
            )}
          </div>

          {/* Description */}
          {!isMobile && (
            <div className='line-clamp-3  mt-6  whitespace-pre-wrap text-14 font-bold dark:text-night-400 '>
              {album?.description || playlist?.description}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='mt-11 flex items-end justify-between lg:z-10 lg:mt-4 lg:justify-start'>
          <div className='flex items-end'>
            <button className='mr-2.5 h-14 w-14 rounded-full dark:bg-white/10 lg:mr-6 lg:h-[72px] lg:w-[72px]'></button>
            <button className='h-14 w-14 rounded-full dark:bg-white/10 lg:mr-6 lg:h-[72px] lg:w-[72px]'></button>
          </div>
          <button
            onClick={() => onPlay()}
            className='h-14 w-[125px] rounded-full dark:bg-brand-700 lg:h-[72px] lg:w-[170px]'
          ></button>
        </div>
      </div>
    </div>
  )
}

export default TrackListHeader
