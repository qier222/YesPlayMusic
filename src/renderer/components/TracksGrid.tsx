import ArtistInline from '@/renderer/components/ArtistsInline'
import Skeleton from '@/renderer/components/Skeleton'
import { player } from '@/renderer/store'
import { resizeImage } from '@/renderer/utils/common'
import SvgIcon from './SvgIcon'

const Track = ({
  track,
  isSkeleton = false,
  isHighlight = false,
  onClick,
}: {
  track: Track
  isSkeleton?: boolean
  isHighlight?: boolean
  onClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
}) => {
  return (
    <div
      onClick={e => onClick(e, track.id)}
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
          {isSkeleton ? (
            <Skeleton className='mr-4 h-9 w-9 rounded-md border border-gray-100' />
          ) : (
            <img
              src={resizeImage(track.al.picUrl, 'xs')}
              className='box-content h-9 w-9 rounded-md border border-black border-opacity-[.03]'
            />
          )}
        </div>

        {/* Track name & Artists */}
        <div className='flex flex-col justify-center'>
          {isSkeleton ? (
            <Skeleton className='text-base '>PLACEHOLDER12345</Skeleton>
          ) : (
            <div
              className={classNames(
                'line-clamp-1 break-all text-base font-semibold ',
                isHighlight ? 'text-brand-500' : 'text-black dark:text-white'
              )}
            >
              {track.name}
            </div>
          )}

          <div className='text-xs text-gray-500 dark:text-gray-400'>
            {isSkeleton ? (
              <Skeleton className='w-2/3 translate-y-px'>PLACE</Skeleton>
            ) : (
              <span className='flex items-center'>
                {track.mark === 1318912 && (
                  <SvgIcon
                    name='explicit'
                    className={classNames(
                      'mr-1 h-3 w-3',
                      isHighlight
                        ? 'text-brand-500'
                        : 'text-gray-300 dark:text-gray-500'
                    )}
                  />
                )}
                <ArtistInline
                  artists={track.ar}
                  disableLink={true}
                  className={
                    isHighlight
                      ? 'text-brand-500'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                />
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
  cols = 2,
}: {
  tracks: Track[]
  isSkeleton?: boolean
  onTrackDoubleClick?: (trackID: number) => void
  cols?: number
}) => {
  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (e.detail === 2) onTrackDoubleClick?.(trackID)
  }

  const playerSnapshot = useSnapshot(player)
  const playingTrack = useMemo(
    () => playerSnapshot.track,
    [playerSnapshot.track]
  )

  return (
    <div
      className='grid gap-x-2'
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {tracks.map((track, index) => (
        <Track
          onClick={handleClick}
          key={track.id}
          track={track}
          isSkeleton={isSkeleton}
          isHighlight={track.id === playingTrack?.id}
        />
      ))}
    </div>
  )
}

export default TrackGrid
