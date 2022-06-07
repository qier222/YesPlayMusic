import { formatDate, formatDuration, resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import Image from './Image'

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

  const cover = album?.picUrl || playlist?.coverImgUrl || ''

  return (
    <div
      className={cx(
        'grid grid-rows-1 gap-10',
        css`
          grid-template-columns: 318px auto;
        `
      )}
    >
      <Image
        className='z-10 aspect-square w-full rounded-24'
        src={resizeImage(cover, 'lg')}
        alt='Cover'
      />

      {/* Blur bg */}
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

      <div className='flex flex-col justify-between'>
        <div>
          <div className='text-36 font-medium dark:text-neutral-100'>
            {album?.name || playlist?.name}
          </div>
          <div className='mt-6 text-24 font-medium dark:text-neutral-600'>
            {album?.artist.name || playlist?.creator.nickname}
          </div>
          <div className='mt-1 flex items-center text-14 font-bold dark:text-neutral-600'>
            {!!album && (
              <>
                {album?.mark === 1056768 && (
                  <Icon name='explicit' className='mb-px mr-1 h-3.5 w-3.5 ' />
                )}{' '}
                {dayjs(album?.publishTime || 0).year()} · {album?.songs.length}{' '}
                Tracks, {albumDuration}
              </>
            )}
            {!!playlist && (
              <>
                Updated at {formatDate(playlist?.updateTime || 0, 'en')} ·{' '}
                {playlist.trackCount} Tracks
              </>
            )}
          </div>
          <div className='line-clamp-3 mt-6 whitespace-pre-wrap text-14 font-bold dark:text-neutral-600'>
            {album?.description || playlist?.description}
          </div>
        </div>

        <div className='z-10 flex'>
          <button
            onClick={() => onPlay()}
            className='h-[72px] w-[170px] rounded-full dark:bg-brand-700'
          ></button>
          <button className='ml-6 h-[72px] w-[72px] rounded-full dark:bg-white/10'></button>
          <button className='ml-6 h-[72px] w-[72px] rounded-full dark:bg-white/10'></button>
        </div>
      </div>
    </div>
  )
}

export default TrackListHeader
