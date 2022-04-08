import { memo } from 'react'
import ArtistInline from '@/renderer/components/ArtistsInline'
import Skeleton from '@/renderer/components/Skeleton'
import SvgIcon from '@/renderer/components/SvgIcon'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/renderer/hooks/useUserLikedTracksIDs'
import { player } from '@/renderer/store'
import { formatDuration } from '@/renderer/utils/common'
import { State as PlayerState } from '@/renderer/utils/player'

const enableRenderLog = true

const PlayOrPauseButtonInTrack = memo(
  ({ isHighlight, trackID }: { isHighlight: boolean; trackID: number }) => {
    if (enableRenderLog)
      console.debug(`Rendering TracksAlbum.tsx PlayOrPauseButtonInTrack`)

    const playerSnapshot = useSnapshot(player)
    const isPlaying = useMemo(
      () => playerSnapshot.state === PlayerState.PLAYING,
      [playerSnapshot.state]
    )

    const onClick = () => {
      isHighlight ? player.playOrPause() : player.playTrack(trackID)
    }

    return (
      <div
        onClick={onClick}
        className={classNames(
          'btn-pressed-animation -ml-1 self-center',
          !isHighlight && 'hidden group-hover:block'
        )}
      >
        <SvgIcon
          className='h-5 w-5 text-brand-500'
          name={isPlaying && isHighlight ? 'pause' : 'play'}
        />
      </div>
    )
  }
)
PlayOrPauseButtonInTrack.displayName = 'PlayOrPauseButtonInTrack'

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
    if (enableRenderLog)
      console.debug(`Rendering TracksAlbum.tsx Track ${track.name}`)

    const subtitle = useMemo(
      () => track.tns?.at(0) ?? track.alia?.at(0),
      [track.alia, track.tns]
    )

    const mutationLikeATrack = useMutationLikeATrack()

    return (
      <div
        onClick={e => onClick(e, track.id)}
        className={classNames(
          'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl',
          'grid-cols-12 py-2.5 px-4',
          !isSkeleton && {
            'btn-hover-animation after:bg-gray-100 dark:after:bg-white/10':
              !isHighlight,
            'bg-brand-50 dark:bg-gray-800': isHighlight,
          }
        )}
      >
        {/* Track name and number */}
        <div className='col-span-6 grid grid-cols-[2rem_auto] pr-8'>
          {/* Track number */}
          {isSkeleton ? (
            <Skeleton className='h-6.5 w-6.5 -translate-x-1'></Skeleton>
          ) : (
            !isHighlight && (
              <div
                className={classNames(
                  'self-center group-hover:hidden',
                  isHighlight && 'text-brand-500',
                  !isHighlight && 'text-gray-500 dark:text-gray-400'
                )}
              >
                {track.no}
              </div>
            )
          )}

          {/* Play or pause button for playing track */}
          {!isSkeleton && (
            <PlayOrPauseButtonInTrack
              isHighlight={isHighlight}
              trackID={track.id}
            />
          )}

          {/* Track name */}
          <div className='flex'>
            {isSkeleton ? (
              <Skeleton className='text-lg'>
                PLACEHOLDER123456789012345
              </Skeleton>
            ) : (
              <div
                className={classNames(
                  'line-clamp-1 break-all text-lg font-semibold',
                  isHighlight ? 'text-brand-500' : 'text-black dark:text-white'
                )}
              >
                <span className='flex items-center'>
                  {track.name}
                  {track.mark === 1318912 && (
                    <SvgIcon
                      name='explicit'
                      className='ml-1.5 mt-[2px] h-4 w-4 text-gray-300 dark:text-gray-500'
                    />
                  )}
                  {subtitle && (
                    <span
                      className={classNames(
                        'ml-1',
                        isHighlight ? 'text-brand-500/[.8]' : 'text-gray-400'
                      )}
                    >
                      ({subtitle})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Artists */}
        <div className='col-span-4 flex items-center'>
          {isSkeleton ? (
            <Skeleton>PLACEHOLDER1234</Skeleton>
          ) : (
            <ArtistInline
              className={
                isHighlight
                  ? 'text-brand-500'
                  : 'text-gray-600 dark:text-gray-400'
              }
              artists={track.ar}
            />
          )}
        </div>

        {/* Actions & Track duration */}
        <div className='col-span-2 flex items-center justify-end'>
          {/* Like button */}
          {!isSkeleton && (
            <button
              onClick={() => track?.id && mutationLikeATrack.mutate(track.id)}
              className={classNames(
                'mr-5 cursor-default transition duration-300 hover:scale-[1.2]',
                isLiked
                  ? 'text-brand-500 opacity-100'
                  : 'text-gray-600 opacity-0 dark:text-gray-400',
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
              className={classNames(
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

const TracksAlbum = ({
  tracks,
  isSkeleton = false,
  onTrackDoubleClick,
}: {
  tracks: Track[]
  isSkeleton?: boolean
  onTrackDoubleClick?: (trackID: number) => void
}) => {
  // Fake data when isSkeleton is true
  const skeletonTracks: Track[] = new Array(1).fill({})

  // Liked songs ids
  const { data: userLikedSongs } = useUserLikedTracksIDs()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, trackID: number) => {
      if (e.detail === 2) onTrackDoubleClick?.(trackID)
    },
    [onTrackDoubleClick]
  )

  const playerSnapshot = useSnapshot(player)
  const playingTrack = useMemo(
    () => playerSnapshot.track,
    [playerSnapshot.track]
  )

  return (
    <div className='grid w-full'>
      {/* Tracks table header */}
      <div className='mx-4 mt-10 mb-2 grid grid-cols-12 border-b border-gray-100 py-2.5 text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500'>
        <div className='col-span-6 grid grid-cols-[2rem_auto]'>
          <div>#</div>
          <div>标题</div>
        </div>
        <div className='col-span-4'>艺人</div>
        <div className='col-span-2 justify-self-end'>时长</div>
      </div>

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
              key={track.id}
              track={track}
              onClick={handleClick}
              isLiked={userLikedSongs?.ids?.includes(track.id) ?? false}
              isSkeleton={false}
              isHighlight={track.id === playingTrack?.id}
            />
          ))}
    </div>
  )
}

export default TracksAlbum
