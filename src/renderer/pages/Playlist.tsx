import { memo } from 'react'
import Button, { Color as ButtonColor } from '@/components/Button'
import Skeleton from '@/components/Skeleton'
import SvgIcon from '@/components/SvgIcon'
import TracksList from '@/components/TracksList'
import usePlaylist from '@/hooks/usePlaylist'
import useScroll from '@/hooks/useScroll'
import useTracksInfinite from '@/hooks/useTracksInfinite'
import { player } from '@/store'
import { formatDate, resizeImage } from '@/utils/common'
import useUserPlaylists, {
  useMutationLikeAPlaylist,
} from '@/hooks/useUserPlaylists'
import useUser from '@/hooks/useUser'

const enableRenderLog = true

const Header = memo(
  ({
    playlist,
    isLoading,
    handlePlay,
  }: {
    playlist: Playlist | undefined
    isLoading: boolean
    handlePlay: () => void
  }) => {
    if (enableRenderLog) console.debug('Rendering Playlist.tsx Header')
    const coverUrl = resizeImage(playlist?.coverImgUrl || '', 'lg')

    const mutationLikeAPlaylist = useMutationLikeAPlaylist()
    const { data: userPlaylists } = useUserPlaylists()

    const isThisPlaylistLiked = useMemo(() => {
      if (!playlist) return false
      return !!userPlaylists?.playlist?.find(p => p.id === playlist.id)
    }, [playlist, userPlaylists?.playlist])

    const { data: user } = useUser()
    const isThisPlaylistCreatedByCurrentUser = useMemo(() => {
      if (!playlist || !user) return false
      return playlist.creator.userId === user?.profile?.userId
    }, [playlist, user])

    return (
      <>
        {/* Header background */}
        <div className='absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden'>
          <img src={coverUrl} className='absolute top-0 w-full blur-[100px]' />
          <img src={coverUrl} className='absolute top-0 w-full blur-[100px]' />
          <div className='absolute top-0 h-full w-full bg-gradient-to-b from-white/[.85] to-white dark:from-black/50 dark:to-[#1d1d1d]'></div>
        </div>

        <div className='grid grid-cols-[17rem_auto] items-center gap-9'>
          {/*  Cover */}
          <div className='relative z-0 aspect-square self-start'>
            {!isLoading && (
              <div
                className='absolute top-3.5 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-2xl bg-cover opacity-40 blur-lg filter'
                style={{
                  backgroundImage: `url("${coverUrl}")`,
                }}
              ></div>
            )}

            {!isLoading && (
              <img
                src={coverUrl}
                className='rounded-2xl border border-black border-opacity-5'
              />
            )}
            {isLoading && (
              <Skeleton v-else className='h-full w-full rounded-2xl' />
            )}
          </div>

          {/* <!-- Playlist info --> */}
          <div className='z-10 flex h-full flex-col justify-between'>
            {/* <!-- Playlist name --> */}
            {!isLoading && (
              <div className='text-4xl font-bold dark:text-white'>
                {playlist?.name}
              </div>
            )}
            {isLoading && (
              <Skeleton v-else className='w-3/4 text-4xl'>
                PLACEHOLDER
              </Skeleton>
            )}

            {/* <!-- Playlist creator --> */}
            {!isLoading && (
              <div className='mt-5 text-lg font-medium text-gray-800 dark:text-gray-300'>
                歌单 · <span>{playlist?.creator?.nickname}</span>
              </div>
            )}
            {isLoading && (
              <Skeleton v-else className='mt-5 w-64 text-lg'>
                PLACEHOLDER
              </Skeleton>
            )}

            {/* <!-- Playlist last update time & track count --> */}
            {!isLoading && (
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                更新于 {formatDate(playlist?.updateTime || 0, 'zh-CN')} ·{' '}
                {playlist?.trackCount} 首歌
              </div>
            )}
            {isLoading && (
              <Skeleton v-else className='w-72 translate-y-px text-sm'>
                PLACEHOLDER
              </Skeleton>
            )}

            {/* <!-- Playlist description --> */}
            {!isLoading && (
              <div className='line-clamp-2 mt-5 min-h-[2.5rem] text-sm text-gray-500 dark:text-gray-400'>
                {playlist?.description}
              </div>
            )}
            {isLoading && (
              <Skeleton v-else className='mt-5 min-h-[2.5rem] w-1/2 text-sm'>
                PLACEHOLDER
              </Skeleton>
            )}

            {/* <!-- Buttons --> */}
            <div className='mt-5 flex gap-4'>
              <Button onClick={() => handlePlay()} isSkelton={isLoading}>
                <SvgIcon name='play' className='-ml-1 mr-1 h-6 w-6' />
                播放
              </Button>

              {!isThisPlaylistCreatedByCurrentUser && (
                <Button
                  color={ButtonColor.Gray}
                  iconColor={
                    isThisPlaylistLiked ? ButtonColor.Primary : ButtonColor.Gray
                  }
                  isSkelton={isLoading}
                  onClick={() =>
                    playlist?.id && mutationLikeAPlaylist.mutate(playlist)
                  }
                >
                  <SvgIcon
                    name={isThisPlaylistLiked ? 'heart' : 'heart-outline'}
                    className='h-6 w-6'
                  />
                </Button>
              )}

              <Button
                color={ButtonColor.Gray}
                iconColor={ButtonColor.Gray}
                isSkelton={isLoading}
                onClick={() => toast('施工中...')}
              >
                <SvgIcon name='more' className='h-6 w-6' />
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }
)
Header.displayName = 'Header'

const Tracks = memo(
  ({
    playlist,
    handlePlay,
    isLoadingPlaylist,
  }: {
    playlist: Playlist | undefined
    handlePlay: (trackID: number | null) => void
    isLoadingPlaylist: boolean
  }) => {
    if (enableRenderLog) console.debug('Rendering Playlist.tsx Tracks')

    const {
      data: tracksPages,
      hasNextPage,
      isLoading: isLoadingTracks,
      isFetchingNextPage,
      fetchNextPage,
    } = useTracksInfinite({
      ids: playlist?.trackIds?.map(t => t.id) || [],
    })

    const scroll = useScroll(document.getElementById('mainContainer'), {
      throttle: 500,
      offset: {
        bottom: 256,
      },
    })

    useEffect(() => {
      if (!scroll.arrivedState.bottom || !hasNextPage || isFetchingNextPage)
        return
      fetchNextPage()
    }, [
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      scroll.arrivedState.bottom,
    ])

    const tracks = useMemo(() => {
      if (!tracksPages) return []
      const allTracks: Track[] = []
      tracksPages.pages.forEach(page => allTracks.push(...(page?.songs ?? [])))
      return allTracks
    }, [tracksPages])

    return (
      <>
        {isLoadingPlaylist ? (
          <TracksList tracks={[]} isSkeleton={true} />
        ) : isLoadingTracks ? (
          <TracksList
            tracks={playlist?.tracks ?? []}
            onTrackDoubleClick={handlePlay}
          />
        ) : (
          <TracksList tracks={tracks} onTrackDoubleClick={handlePlay} />
        )}
      </>
    )
  }
)
Tracks.displayName = 'Tracks'

const Playlist = () => {
  if (enableRenderLog) console.debug('Rendering Playlist.tsx Playlist')

  const params = useParams()
  const { data: playlist, isLoading } = usePlaylist({
    id: Number(params.id) || 0,
  })

  const handlePlay = useCallback(
    (trackID: number | null = null) => {
      if (!playlist?.playlist?.id) {
        toast('无法播放歌单')
        return
      }
      player.playPlaylist(playlist.playlist.id, trackID)
    },
    [playlist]
  )

  return (
    <div className='mt-10'>
      <Header
        playlist={playlist?.playlist}
        isLoading={isLoading}
        handlePlay={handlePlay}
      />

      <Tracks
        playlist={playlist?.playlist}
        handlePlay={handlePlay}
        isLoadingPlaylist={isLoading}
      />
    </div>
  )
}

export default Playlist
