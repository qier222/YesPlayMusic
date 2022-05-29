import { formatDuration, resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import Image from './Image'

const TrackListHeader = ({
  album,
  onPlay,
}: {
  album?: Album
  onPlay: () => void
}) => {
  const albumDuration = useMemo(() => {
    const duration = album?.songs?.reduce((acc, cur) => acc + cur.dt, 0) || 0
    return formatDuration(duration, 'en', 'hh[hr] mm[min]')
  }, [album?.songs])

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
        src={resizeImage(album?.picUrl || '', 'lg')}
        alt='Cover'
      />

      <img
        className={cx(
          'fixed z-0 object-cover opacity-70',
          css`
            top: -400px;
            left: -370px;
            width: 1572px;
            height: 528px;
            filter: blur(256px) saturate(1.2);
            /* transform: scale(0.5); */
          `
        )}
        src={resizeImage(album?.picUrl || '', 'lg')}
      />

      <div className=' flex flex-col justify-between'>
        <div>
          <div className='text-36 font-medium dark:text-neutral-100'>
            {album?.name}
          </div>
          <div className='mt-6 text-24 font-medium dark:text-neutral-600'>
            {album?.artist.name}
          </div>
          <div className='mt-1 flex items-center text-14 font-bold dark:text-neutral-600'>
            {album?.mark === 1056768 && (
              <Icon name='explicit' className='mb-px mr-1 h-3.5 w-3.5 ' />
            )}{' '}
            {dayjs(album?.publishTime || 0).year()} · {album?.songs.length}{' '}
            Songs, {albumDuration}
          </div>
          <div className='line-clamp-3 mt-6 text-14 font-bold dark:text-neutral-600'>
            {album?.description}
          </div>
        </div>

        <div className='z-10 flex'>
          <button
            onClick={onPlay}
            className='h-[72px] w-[170px] rounded-full dark:bg-brand-700'
          ></button>
          <button className='ml-6 h-[72px] w-[72px] rounded-full dark:bg-night-50'></button>
          <button className='ml-6 h-[72px] w-[72px] rounded-full dark:bg-night-50'></button>
        </div>
      </div>
    </div>
  )
}

export default TrackListHeader
