import { Fragment, memo } from 'react'
import { NavLink } from 'react-router-dom'
import ArtistInline from '@/components/ArtistsInline'
import Skeleton from '@/components/Skeleton'
import SvgIcon from '@/components/SvgIcon'
import { prefetchAlbum } from '@/hooks/useAlbum'
import useUser from '@/hooks/useUser'
import useUserLikedSongsIDs from '@/hooks/useUserLikedSongsIDs'
import { formatDuration, resizeImage } from '@/utils/common'
import { player } from '@/store'

const Track = memo(
  ({
    track,
    isLiked = false,
    isSkeleton = false,
    isPlaying = false,
    subtitle = undefined,
    onClick,
  }: {
    track: Track
    isLiked?: boolean
    isSkeleton?: boolean
    isPlaying?: boolean
    subtitle?: string
    onClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
  }) => {
    return (
      <div
        onClick={e => onClick(e, track.id)}
        className={classNames(
          'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl dark:after:bg-white/[.08]',
          'grid-cols-12 p-2 pr-4',
          !isSkeleton && !isPlaying && 'btn-hover-animation after:bg-gray-100 dark:after:bg-white/[.08]',
          !isSkeleton && isPlaying && 'bg-brand-100 dark:bg-gray-800'
        )}
      >
        {/* Track info */}
        <div className="col-span-6 grid grid-cols-[4.2rem_auto] pr-8">
          {/* Cover */}
          <div>
            {isSkeleton ? (
              <Skeleton className="mr-4 h-12 w-12 rounded-md border border-gray-100 dark:border-gray-800" />
            ) : (
              <img
                src={resizeImage(track.al.picUrl, 'xs')}
                className="box-content h-12 w-12 rounded-md border border-black border-opacity-[.03]"
              />
            )}
          </div>

          {/* Track name & Artists */}
          <div className="flex flex-col justify-center">
            {isSkeleton ? (
              <Skeleton className="text-lg">PLACEHOLDER12345</Skeleton>
            ) : (
              <div
                className={classNames(
                  "line-clamp-1 break-all text-lg font-semibold",
                  isPlaying ? "text-brand-500" : "text-black dark:text-white"
                )}
              >
                <span>{track.name}</span>
                {subtitle && (
                  <span
                    title={subtitle}
                    className={classNames(
                      "ml-1",
                      isPlaying ? "text-brand-500/[.8]" : "text-gray-400"
                    )}
                  >
                    ({subtitle})
                  </span>
                )}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isSkeleton ? (
                <Skeleton className="w-2/3 translate-y-px">PLACE</Skeleton>
              ) : (
                <ArtistInline artists={track.ar} />
              )}
            </div>
          </div>
        </div>

        {/* Album name */}
        <div className="col-span-4 flex items-center text-gray-600 dark:text-gray-400">
          {isSkeleton ? (
            <Skeleton>PLACEHOLDER1234567890</Skeleton>
          ) : (
            <Fragment>
              <NavLink
                to={`/album/${track.al.id}`}
                onMouseOver={() => prefetchAlbum({ id: track.al.id })}
                className={classNames("hover:underline", isPlaying && "text-brand-500")}
              >
                {track.al.name}
              </NavLink>
              <span className="flex-grow"></span>
            </Fragment>
          )}
        </div>

        {/* Actions & Track duration */}
        <div className="col-span-2 flex items-center justify-end">
          {/* Like button */}
          {!isSkeleton && (
            <button
              className={classNames(
                'mr-5 cursor-default transition duration-300 hover:scale-[1.2]',
                !isLiked && 'text-gray-600 opacity-0 dark:text-gray-400',
                isLiked && 'text-brand-500 opacity-100',
                !isSkeleton && 'group-hover:opacity-100'
              )}
            >
              <SvgIcon
                name={isLiked ? 'heart' : 'heart-outline'}
                className="h-4 w-4 "
              />
            </button>
          )}

          {/* Track duration */}
          {isSkeleton ? (
            <Skeleton>0:00</Skeleton>
          ) : (
            <div
              className={classNames(
                "min-w-[2.5rem] text-right",
                isPlaying ? "text-brand-500" : "text-gray-600 dark:text-gray-400"
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
    console.debug('Rendering TrackList.tsx TrackList')

    // Fake data when isLoading is true
    const skeletonTracks: Track[] = new Array(12).fill({})

    // Liked songs ids
    const { data: user } = useUser()
    const { data: userLikedSongs } = useUserLikedSongsIDs({
      uid: user?.account?.id ?? 0,
    })

    const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
      if (e.detail === 2) onTrackDoubleClick?.(trackID)
    }

    const playerSnapshot = useSnapshot(player)
    const playingTrack = useMemo(
      () => playerSnapshot.track,
      [playerSnapshot.track]
    )

    return (
      <Fragment>
        {/* Tracks table header */}
        <div className="ml-2 mr-4 mt-10 mb-2 grid grid-cols-12 border-b border-gray-100 py-2.5 text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
          <div className="col-span-6 grid grid-cols-[4.2rem_auto]">
            <div></div>
            <div>TITLE</div>
          </div>
          <div className="col-span-4">ALBUM</div>
          <div className="col-span-2 justify-self-end">TIME</div>
        </div>

        <div className="grid w-full gap-1">
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
                  isPlaying={track.id === playingTrack?.id}
                  subtitle={track.tns?.at(0) ?? track.alia?.at(0)}
                />
              ))}
        </div>
      </Fragment>
    )
  }
)
TracksList.displayName = 'TracksList'

export default TracksList
