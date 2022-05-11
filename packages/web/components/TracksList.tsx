import { memo, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import ArtistInline from '@/web/components/ArtistsInline'
import Skeleton from '@/web/components/Skeleton'
import SvgIcon from '@/web/components/SvgIcon'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/hooks/useUserLikedTracksIDs'
import { formatDuration, resizeImage } from '@/web/utils/common'
import { player } from '@/web/store'
import cx from 'classnames'
import { useSnapshot } from 'valtio'

const Track = memo(
  ({
    track,
    isLiked = false,
    isSkeleton = false,
    isHighlight = false,
    onClick,
  }: {
    track: Track
    isLiked?: boolean
    isSkeleton?: boolean
    isHighlight?: boolean
    onClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
  }) => {
    const subtitle = useMemo(
      () => track.tns?.at(0) ?? track.alia?.at(0),
      [track.alia, track.tns]
    )
    const mutationLikeATrack = useMutationLikeATrack()

    return (
      <div
        onClick={e => onClick(e, track.id)}
        className={cx(
          'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl ',
          'grid-cols-12 p-2 pr-4',
          !isSkeleton &&
            !isHighlight &&
            'btn-hover-animation after:bg-gray-100 dark:after:bg-white/10',
          !isSkeleton && isHighlight && 'bg-brand-50 dark:bg-gray-800'
        )}
      >
        {/* Track info */}
        <div className='col-span-6 grid grid-cols-[4.2rem_auto] pr-8'>
          {/* Cover */}
          <div>
            {isSkeleton ? (
              <Skeleton className='mr-4 h-12 w-12 rounded-md border border-gray-100 dark:border-gray-800' />
            ) : (
              <img
                src={resizeImage(track.al.picUrl, 'xs')}
                className='box-content h-12 w-12 rounded-md border border-black border-opacity-[.03]'
              />
            )}
          </div>

          {/* Track name & Artists */}
          <div className='flex flex-col justify-center'>
            {isSkeleton ? (
              <Skeleton className='text-lg'>PLACEHOLDER12345</Skeleton>
            ) : (
              <div
                className={cx(
                  'line-clamp-1 break-all text-lg font-semibold',
                  isHighlight ? 'text-brand-500' : 'text-black dark:text-white'
                )}
              >
                <span>{track.name}</span>
                {subtitle && (
                  <span
                    title={subtitle}
                    className={cx(
                      'ml-1',
                      isHighlight ? 'text-brand-500/[.8]' : 'text-gray-400'
                    )}
                  >
                    ({subtitle})
                  </span>
                )}
              </div>
            )}

            <div
              className={cx(
                'text-sm',
                isHighlight
                  ? 'text-brand-500'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {isSkeleton ? (
                <Skeleton className='w-2/3 translate-y-px'>PLACE</Skeleton>
              ) : (
                <span className='inline-flex items-center'>
                  {track.mark === 1318912 && (
                    <SvgIcon
                      name='explicit'
                      className='mr-1 h-3.5 w-3.5 text-gray-300 dark:text-gray-500'
                    />
                  )}
                  <ArtistInline artists={track.ar} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Album name */}
        <div className='col-span-4 flex items-center text-gray-600 dark:text-gray-400'>
          {isSkeleton ? (
            <Skeleton>PLACEHOLDER1234567890</Skeleton>
          ) : (
            <>
              <NavLink
                to={`/album/${track.al.id}`}
                className={cx(
                  'hover:underline',
                  isHighlight && 'text-brand-500'
                )}
              >
                {track.al.name}
              </NavLink>
              <span className='flex-grow'></span>
            </>
          )}
        </div>

        {/* Actions & Track duration */}
        <div className='col-span-2 flex items-center justify-end'>
          {/* Like button */}
          {!isSkeleton && (
            <button
              onClick={() => track?.id && mutationLikeATrack.mutate(track.id)}
              className={cx(
                'mr-5 cursor-default transition duration-300 hover:scale-[1.2]',
                !isLiked && 'text-gray-600 opacity-0 dark:text-gray-400',
                isLiked && 'text-brand-500 opacity-100',
                !isSkeleton && 'group-hover:opacity-100'
              )}
            >
              <SvgIcon
                name={isLiked ? 'heart' : 'heart-outline'}
                className='h-5 w-5'
              />
            </button>
          )}

          {/* Track duration */}
          {isSkeleton ? (
            <Skeleton>0:00</Skeleton>
          ) : (
            <div
              className={cx(
                'min-w-[2.5rem] text-right',
                isHighlight
                  ? 'text-brand-500'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {formatDuration(track.dt, 'en', 'hh:mm:ss')}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Track.displayName = 'Track'

const TracksList = memo(
  ({
    tracks,
    isSkeleton = false,
    onTrackDoubleClick,
  }: {
    tracks: Track[]
    isSkeleton?: boolean
    onTrackDoubleClick?: (trackID: number) => void
  }) => {
    // Fake data when isLoading is true
    const skeletonTracks: Track[] = new Array(12).fill({})

    // Liked songs ids
    const { data: userLikedSongs } = useUserLikedTracksIDs()

    const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
      if (e.detail === 2) onTrackDoubleClick?.(trackID)
    }

    const playerSnapshot = useSnapshot(player)
    const playingTrack = useMemo(
      () => playerSnapshot.track,
      [playerSnapshot.track]
    )

    return (
      <>
        {/* Tracks table header */}
        <div className='ml-2 mr-4 mt-10 mb-2 grid grid-cols-12 border-b border-gray-100 py-2.5 text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500'>
          <div className='col-span-6 grid grid-cols-[4.2rem_auto]'>
            <div></div>
            <div>标题</div>
          </div>
          <div className='col-span-4'>专辑</div>
          <div className='col-span-2 justify-self-end'>时长</div>
        </div>

        <div className='grid w-full'>
          {/* Tracks */}
          {isSkeleton
            ? skeletonTracks.map((track, index) => (
                <Track
                  key={index}
                  track={track}
                  onClick={() => null}
                  isSkeleton={true}
                />
              ))
            : tracks.map(track => (
                <Track
                  onClick={handleClick}
                  key={track.id}
                  track={track}
                  isLiked={userLikedSongs?.ids?.includes(track.id) ?? false}
                  isSkeleton={false}
                  isHighlight={track.id === playingTrack?.id}
                />
              ))}
        </div>
      </>
    )
  }
)
TracksList.displayName = 'TracksList'

export default TracksList
