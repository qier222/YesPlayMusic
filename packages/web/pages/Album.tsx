import dayjs from 'dayjs'
import { NavLink, useParams } from 'react-router-dom'
import Button, { Color as ButtonColor } from '@/web/components/Button'
import CoverRow, { Subtitle } from '@/web/components/CoverRow'
import Skeleton from '@/web/components/Skeleton'
import SvgIcon from '@/web/components/SvgIcon'
import TracksAlbum from '@/web/components/TracksAlbum'
import useAlbum from '@/web/hooks/useAlbum'
import useArtistAlbums from '@/web/hooks/useArtistAlbums'
import { player } from '@/web/store'
import {
  Mode as PlayerMode,
  State as PlayerState,
  TrackListSourceType,
} from '@/web/utils/player'
import {
  formatDate,
  formatDuration,
  resizeImage,
  scrollToTop,
} from '@/web/utils/common'
import useTracks from '@/web/hooks/useTracks'
import useUserAlbums, {
  useMutationLikeAAlbum,
} from '@/web/hooks/useUserAlbums'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSnapshot } from 'valtio'

const PlayButton = ({
  album,
  handlePlay,
  isLoading,
}: {
  album: Album | undefined
  handlePlay: () => void
  isLoading: boolean
}) => {
  const playerSnapshot = useSnapshot(player)
  const isThisAlbumPlaying = useMemo(
    () =>
      playerSnapshot.mode === PlayerMode.TrackList &&
      playerSnapshot.trackListSource?.type === TrackListSourceType.Album &&
      playerSnapshot.trackListSource?.id === album?.id,
    [
      playerSnapshot.mode,
      playerSnapshot.trackListSource?.type,
      playerSnapshot.trackListSource?.id,
      album?.id,
    ]
  )

  const isPlaying =
    isThisAlbumPlaying &&
    [PlayerState.Playing, PlayerState.Loading].includes(playerSnapshot.state)

  const wrappedHandlePlay = () => {
    if (isThisAlbumPlaying) {
      player.playOrPause()
    } else {
      handlePlay()
    }
  }

  return (
    <Button onClick={wrappedHandlePlay} isSkelton={isLoading}>
      <SvgIcon
        name={isPlaying ? 'pause' : 'play'}
        className='mr-1 -ml-1 h-6 w-6'
      />
      {isPlaying ? '暂停' : '播放'}
    </Button>
  )
}

const Header = ({
  album,
  isLoading,
  handlePlay,
}: {
  album: Album | undefined
  isLoading: boolean
  handlePlay: () => void
}) => {
  const coverUrl = resizeImage(album?.picUrl || '', 'lg')

  const albumDuration = useMemo(() => {
    const duration = album?.songs?.reduce((acc, cur) => acc + cur.dt, 0) || 0
    return formatDuration(duration, 'zh-CN', 'hh[hr] mm[min]')
  }, [album?.songs])

  const [isCoverError, setCoverError] = useState(
    coverUrl.includes('3132508627578625')
  )

  const { data: userAlbums } = useUserAlbums()
  const isThisAlbumLiked = useMemo(() => {
    if (!album) return false
    return !!userAlbums?.data?.find(a => a.id === album.id)
  }, [album, userAlbums?.data])
  const mutationLikeAAlbum = useMutationLikeAAlbum()

  return (
    <>
      {/* Header background */}
      <div className='absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden'>
        {coverUrl && !isCoverError && (
          <>
            <img
              src={coverUrl}
              className='absolute -top-full w-full blur-[100px]'
            />
            <img
              src={coverUrl}
              className='absolute -top-full w-full blur-[100px]'
            />
          </>
        )}
        <div className='absolute top-0 h-full w-full bg-gradient-to-b from-white/[.85] to-white dark:from-black/50 dark:to-[#1d1d1d]'></div>
      </div>

      <div className='grid grid-cols-[17rem_auto] items-center gap-9'>
        {/*  Cover */}
        <div className='relative z-0 aspect-square self-start'>
          {/* Neon shadow */}
          {!isLoading && coverUrl && !isCoverError && (
            <div
              className='absolute top-3.5 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-2xl bg-cover opacity-40 blur-lg filter'
              style={{
                backgroundImage: `url("${coverUrl}")`,
              }}
            ></div>
          )}

          {!isLoading && isCoverError ? (
            // Fallback cover
            <div className='flex h-full w-full items-center justify-center rounded-2xl border border-black border-opacity-5 bg-gray-100 text-gray-300'>
              <SvgIcon name='music-note' className='h-1/2 w-1/2' />
            </div>
          ) : (
            coverUrl && (
              <img
                src={coverUrl}
                className='w-full rounded-2xl border border-b-0 border-black border-opacity-5 dark:border-white dark:border-opacity-5'
                onError={() => setCoverError(true)}
              />
            )
          )}
          {isLoading && <Skeleton className='h-full w-full rounded-2xl' />}
        </div>

        {/* Info */}
        <div className='z-10 flex h-full flex-col justify-between'>
          {/*  Name */}
          {isLoading ? (
            <Skeleton className='w-3/4 text-6xl'>PLACEHOLDER</Skeleton>
          ) : (
            <div className='text-6xl font-bold dark:text-white'>
              {album?.name}
            </div>
          )}

          {/*  Artist */}
          {isLoading ? (
            <Skeleton className='mt-5 w-64 text-lg'>PLACEHOLDER</Skeleton>
          ) : (
            <div className='mt-5 text-lg font-medium text-gray-800 dark:text-gray-300'>
              Album ·{' '}
              <NavLink
                to={`/artist/${album?.artist.id}`}
                className='cursor-default font-semibold hover:underline'
              >
                {album?.artist.name}
              </NavLink>
            </div>
          )}

          {/* Release date & track count & album duration */}
          {isLoading ? (
            <Skeleton className='w-72 translate-y-px text-sm'>
              PLACEHOLDER
            </Skeleton>
          ) : (
            <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
              {album?.mark === 1056768 && (
                <SvgIcon
                  name='explicit'
                  className='mt-px mr-1 h-4 w-4 text-gray-400 dark:text-gray-500'
                />
              )}
              {dayjs(album?.publishTime || 0).year()} · {album?.size} 首歌 ·{' '}
              {albumDuration}
            </div>
          )}

          {/* Description */}
          {isLoading ? (
            <Skeleton className='mt-5 min-h-[2.5rem] w-1/2 text-sm'>
              PLACEHOLDER
            </Skeleton>
          ) : (
            <div className='line-clamp-2 mt-5 min-h-[2.5rem] text-sm text-gray-500 dark:text-gray-400'>
              {album?.description}
            </div>
          )}

          {/*  Buttons */}
          <div className='mt-5 flex gap-4'>
            <PlayButton {...{ album, handlePlay, isLoading }} />

            <Button
              color={ButtonColor.Gray}
              iconColor={
                isThisAlbumLiked ? ButtonColor.Primary : ButtonColor.Gray
              }
              isSkelton={isLoading}
              onClick={() => album?.id && mutationLikeAAlbum.mutate(album)}
            >
              <SvgIcon
                name={isThisAlbumLiked ? 'heart' : 'heart-outline'}
                className='h-6 w-6'
              />
            </Button>

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

const MoreAlbum = ({ album }: { album: Album | undefined }) => {
  // Fetch artist's albums
  const { data: albums, isLoading } = useArtistAlbums({
    id: album?.artist.id ?? 0,
    limit: 1000,
  })

  const filteredAlbums = useMemo((): Album[] => {
    if (!albums) return []
    const allReleases = albums?.hotAlbums || []
    const filteredAlbums = allReleases.filter(
      album =>
        ['专辑', 'EP/Single', 'EP'].includes(album.type) && album.size > 1
    )
    const singles = allReleases.filter(album => album.type === 'Single')

    const qualifiedAlbums = [...filteredAlbums, ...singles]

    const formatName = (name: string) =>
      name.toLowerCase().replace(/(\s|deluxe|edition|\(|\))/g, '')

    const uniqueAlbums: Album[] = []
    qualifiedAlbums.forEach(a => {
      // 去除当前页面的专辑
      if (formatName(a.name) === formatName(album?.name ?? '')) return

      // 去除重复的专辑(包含 deluxe edition 的专辑会视为重复)
      if (
        uniqueAlbums.findIndex(aa => {
          return formatName(a.name) === formatName(aa.name)
        }) !== -1
      ) {
        return
      }

      // 去除 remix 专辑
      if (
        a.name.toLowerCase().includes('remix)') ||
        a.name.toLowerCase().includes('remixes)')
      ) {
        return
      }

      uniqueAlbums.push(a)
    })

    return uniqueAlbums.slice(0, 5)
  }, [album?.name, albums])

  return (
    <div>
      <div className='my-5 h-px w-full bg-gray-100 dark:bg-gray-800'></div>
      {!isLoading && albums?.hotAlbums?.length && (
        <div className='pl-px text-[1.375rem] font-semibold text-gray-800 dark:text-gray-100'>
          More by{' '}
          <NavLink
            to={`/artist/${album?.artist?.id}`}
            className='cursor-default hover:underline'
          >
            {album?.artist.name}
          </NavLink>
        </div>
      )}
      <div className='mt-3'>
        <CoverRow
          albums={
            filteredAlbums.length ? filteredAlbums : albums?.hotAlbums || []
          }
          subtitle={Subtitle.TypeReleaseYear}
          isSkeleton={isLoading}
          rows={1}
          navigateCallback={scrollToTop}
        />
      </div>
    </div>
  )
}

const Album = () => {
  const params = useParams()
  const { data: album, isLoading } = useAlbum({
    id: Number(params.id) || 0,
  })

  const { data: tracks } = useTracks({
    ids: album?.songs?.map(track => track.id) ?? [],
  })

  const handlePlay = async (trackID: number | null = null) => {
    if (!album?.album.id) {
      toast('无法播放专辑，该专辑不存在')
      return
    }
    await player.playAlbum(album.album.id, trackID)
  }

  return (
    <div className='mt-10'>
      <Header
        album={album?.album}
        isLoading={isLoading}
        handlePlay={handlePlay}
      />
      <TracksAlbum
        tracks={tracks?.songs ?? album?.album.songs ?? []}
        onTrackDoubleClick={handlePlay}
        isSkeleton={isLoading}
      />
      {album?.album && (
        <div className='mt-5 text-xs text-gray-400'>
          <div> Released {formatDate(album.album.publishTime || 0, 'en')} </div>
          {album.album.company && (
            <div className='mt-[2px]'>© {album.album.company} </div>
          )}
        </div>
      )}
      {!isLoading && <MoreAlbum album={album?.album} />}
    </div>
  )
}

export default Album
