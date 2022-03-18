import { memo } from 'react'
import ArtistInline from '@/components/ArtistsInline'
import Skeleton from '@/components/Skeleton'
import SvgIcon from '@/components/SvgIcon'
import useUser from '@/hooks/useUser'
import useUserLikedSongsIDs from '@/hooks/useUserLikedSongsIDs'
import { player } from '@/store'
import { formatDuration } from '@/utils/common'
import { State as PlayerState } from '@/utils/player'

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
          'self-center',
          !isHighlight && 'hidden group-hover:block'
        )}
      >
        <SvgIcon
          className='h-3.5 w-3.5 text-brand-500'
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
    subtitle = undefined,
    onClick,
  }: {
    track: Track
    isLiked?: boolean
    isSkeleton?: boolean
    isHighlight?: boolean
    subtitle?: string
    onClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
  }) => {
    if (enableRenderLog)
      console.debug(`Rendering TracksAlbum.tsx Track ${track.name}`)

    return (
      <div
        onClick={e => onClick(e, track.id)}
        className={classNames(
          'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl',
          'grid-cols-12 py-2.5 px-4',
          !isSkeleton && {
            'btn-hover-animation after:bg-gray-100 dark:after:bg-white/[.08]':
              !isHighlight,
            'bg-brand-100 dark:bg-gray-800': isHighlight,
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
                <span>{track.name}</span>
                {subtitle && (
                  <span
                    title={subtitle}
                    className={classNames(
                      'ml-1',
                      isHighlight ? 'text-brand-500/[.8]' : 'text-gray-400'
                    )}>
                    ({subtitle})
                  </span>
                )}
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
                className='h-4 w-4 '
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
  const { data: user } = useUser()
  const { data: userLikedSongs } = useUserLikedSongsIDs({
    uid: user?.account?.id ?? 0,
  })

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
          <div>TITLE</div>
        </div>
        <div className='col-span-4'>ARTIST</div>
        <div className='col-span-2 justify-self-end'>TIME</div>
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
              subtitle={track.tns?.at(0) ?? track.alia?.at(0)}
            />
          ))}
    </div>
  )
}

export default TracksAlbum
