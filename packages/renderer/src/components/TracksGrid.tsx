import ArtistInline from '@/components/ArtistsInline'
import Skeleton from '@/components/Skeleton'
import { resizeImage } from '@/utils/common'
import { Fragment } from 'react'
import SvgIcon from './SvgIcon'

const Track = ({
  track,
  isSkeleton = false,
  isHighlight = false,
}: {
  track: Track
  isSkeleton: boolean
  isHighlight: boolean
}) => {
  return (
    <div
      className={classNames(
        'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl ',
        'grid-cols-1 py-1.5 px-2',
        !isSkeleton && {
          'btn-hover-animation after:bg-gray-100 dark:after:bg-white/10':
            !isHighlight,
          'bg-brand-50 dark:bg-gray-800': isHighlight,
        }
      )}
    >
      <div className='grid grid-cols-[3rem_auto] items-center'>
        {/* Cover */}
        <div>
          {!isSkeleton && (
            <img
              src={resizeImage(track.al.picUrl, 'xs')}
              className='box-content h-9 w-9 rounded-md border border-black border-opacity-[.03]'
            />
          )}
          {isSkeleton && (
            <Skeleton className='mr-4 h-9 w-9 rounded-md border border-gray-100' />
          )}
        </div>

        {/* Track name & Artists */}
        <div className='flex flex-col justify-center'>
          {!isSkeleton && (
            <div
              v-if='!isSkeleton'
              className='line-clamp-1 break-all text-base font-semibold dark:text-white'
            >
              {track.name}
            </div>
          )}
          {isSkeleton && (
            <Skeleton className='text-base '>PLACEHOLDER12345</Skeleton>
          )}

          <div className='text-xs text-gray-500 dark:text-gray-400'>
            {isSkeleton ? (
              <Skeleton className='w-2/3 translate-y-px'>PLACE</Skeleton>
            ) : (
              <span className='flex items-center'>
                {track.mark === 1318912 && (
                  <SvgIcon
                    name='explicit'
                    className='mr-1 h-3 w-3 text-gray-300 dark:text-gray-500'
                  />
                )}
                <ArtistInline artists={track.ar} disableLink={true} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const TrackGrid = ({
  tracks,
  isSkeleton = false,
  onTrackDoubleClick,
}: {
  tracks: Track[]
  isSkeleton?: boolean
  onTrackDoubleClick?: (trackID: number) => void
}) => {
  return (
    <div className='grid grid-cols-2 gap-x-2'>
      {tracks.map((track, index) => (
        <Track key={track.id} track={track} isSkeleton={isSkeleton} />
      ))}
    </div>
  )
}

export default TrackGrid
