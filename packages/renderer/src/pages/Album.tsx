import dayjs from 'dayjs'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import Button, { Color as ButtonColor } from '@/components/Button'
import CoverRow, { Subtitle } from '@/components/CoverRow'
import Skeleton from '@/components/Skeleton'
import SvgIcon from '@/components/SvgIcon'
import TracksAlbum from '@/components/TracksAlbum'
import useAlbum from '@/hooks/useAlbum'
import useArtistAlbums from '@/hooks/useArtistAlbums'
import { player } from '@/store'
import { formatDate, formatDuration, resizeImage } from '@/utils/common'

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
    return formatDuration(duration, 'en', 'hh[hr] mm[min]')
  }, [album?.songs])

  const [isCoverError, setCoverError] = useState(false)

  return (
    <Fragment>
      {/* Header background */}
      <div className="absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden">
        {coverUrl && !isCoverError && (
          <Fragment>
            <img
              src={coverUrl}
              className="absolute top-[-50%] w-full blur-[100px]"
            />
            <img
              src={coverUrl}
              className="absolute top-[-50%] w-full blur-[100px]"
            />
          </Fragment>
        )}
        <div className="absolute top-0 h-full w-full bg-gradient-to-b from-white/[.84] to-white dark:from-black/[.5] dark:to-[#1d1d1d]"></div>
      </div>

      <div className="grid grid-cols-[17rem_auto] items-center gap-9">
        {/*  Cover */}
        <div className="relative z-0 aspect-square self-start">
          {/* Neon shadow */}
          {!isLoading && coverUrl && !isCoverError && (
            <div
              className="absolute top-3.5 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-2xl bg-cover opacity-40 blur-lg filter"
              style={{
                backgroundImage: `url("${coverUrl}")`,
              }}
            ></div>
          )}

          {!isLoading && isCoverError ? (
            // Fallback cover
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-black border-opacity-5 bg-gray-100 text-gray-300">
              <SvgIcon name="music-note" className="h-1/2 w-1/2" />
            </div>
          ) : (
            coverUrl && (
              <img
                src={coverUrl}
                className="rounded-2xl border border-b-0 border-black border-opacity-5 dark:border-white dark:border-opacity-5"
                onError={() => setCoverError(true)}
              />
            )
          )}
          {isLoading && <Skeleton className="h-full w-full rounded-2xl" />}
        </div>

        {/* Info */}
        <div className="z-10 flex h-full flex-col justify-between">
          {/*  Name */}
          {!isLoading && (
            <div className="text-6xl font-bold dark:text-white">
              {album?.name}
            </div>
          )}
          {isLoading && (
            <Skeleton className="w-3/4 text-6xl">PLACEHOLDER</Skeleton>
          )}

          {/*  Artist */}
          {!isLoading && (
            <div className="mt-5 text-lg font-medium text-gray-800 dark:text-gray-300">
              Album by{' '}
              <NavLink
                to={`/artist/${album?.artist.name}`}
                className="cursor-default font-semibold hover:underline"
              >
                {album?.artist.name}
              </NavLink>
            </div>
          )}
          {isLoading && (
            <Skeleton className="mt-5 w-64 text-lg">PLACEHOLDER</Skeleton>
          )}

          {/* Release date & track count & album duration */}
          {!isLoading && (
            <div className="text-sm font-thin text-gray-500 dark:text-gray-400">
              {dayjs(album?.publishTime || 0).year()} · {album?.size} Songs,{' '}
              {albumDuration}
            </div>
          )}
          {isLoading && (
            <Skeleton className="w-72 translate-y-px text-sm">
              PLACEHOLDER
            </Skeleton>
          )}

          {/* Description */}
          {!isLoading && (
            <div className="line-clamp-2 mt-5 min-h-[2.5rem] text-sm text-gray-500 dark:text-gray-400">
              {album?.description}
            </div>
          )}
          {isLoading && (
            <Skeleton className="mt-5 min-h-[2.5rem] w-1/2 text-sm">
              PLACEHOLDER
            </Skeleton>
          )}

          {/*  Buttons */}
          <div className="mt-5 flex gap-4">
            <Button onClick={() => handlePlay()} isSkelton={isLoading}>
              <SvgIcon name="play" className="mr-2 h-4 w-4" />
              PLAY
            </Button>

            <Button color={ButtonColor.Gray} isSkelton={isLoading}>
              <SvgIcon name="heart" className="h-4 w-4" />
            </Button>

            <Button
              color={ButtonColor.Gray}
              iconColor={ButtonColor.Gray}
              isSkelton={isLoading}
            >
              <SvgIcon name="more" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
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
    const albumID = album?.id
    const allReleases = albums?.hotAlbums || []
    const filteredAlbums = allReleases.filter(
      album =>
        ['专辑', 'EP/Single', 'EP'].includes(album.type) && album.size > 1
    )
    const singles = allReleases.filter(album => album.type === 'Single')

    const qualifiedAlbums = [...filteredAlbums, ...singles]

    const uniqueAlbums: Album[] = []
    qualifiedAlbums.forEach(a => {
      // 去除当前页面的专辑
      if (Number(a.id) === Number(albumID) || album?.name === a.name) return

      // 去除重复的专辑(包含 deluxe edition 的专辑会视为重复)
      if (
        uniqueAlbums.findIndex(aa => {
          return (
            a.name === aa.name ||
            a.name.toLowerCase().replace(/(\s|deluxe|edition|\(|\))/g, '') ===
              aa.name.toLowerCase().replace(/(\s|deluxe|edition|\(|\))/g, '')
          )
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
  }, [album?.id, album?.name, albums])

  return (
    <div>
      <div className="my-5 h-px w-full bg-gray-100 dark:bg-gray-800"></div>
      <div className="pl-px text-[1.375rem] font-semibold text-gray-800 dark:text-gray-100">
        More by{' '}
        <NavLink
          to={`/artist/${album?.artist?.id}`}
          className="cursor-default hover:underline"
        >
          {album?.artist.name}
        </NavLink>
      </div>
      <div className="mt-3">
        <CoverRow
          albums={filteredAlbums}
          subtitle={Subtitle.TYPE_RELEASE_YEAR}
          isSkeleton={isLoading}
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

  const handlePlay = async (trackID: number | null = null) => {
    const realAlbum = album?.album
    if (!realAlbum) {
      toast('Failed to play album')
      return
    }
    await player.playAlbum(realAlbum, trackID)
  }

  return (
    <div className="mt-10">
      <Header
        album={album?.album}
        isLoading={isLoading}
        handlePlay={handlePlay}
      />
      <TracksAlbum
        tracks={album?.album.songs ?? []}
        onTrackDoubleClick={handlePlay}
        isSkeleton={isLoading}
      />
      {album?.album && (
        <div className="mt-5 text-xs text-gray-400">
          <div> Released {formatDate(album.album.publishTime || 0, 'en')} </div>
          {album.album.company && (
            <div className="mt-[2px]">© {album.album.company} </div>
          )}
        </div>
      )}
      {!isLoading && <MoreAlbum album={album?.album} />}
    </div>
  )
}

export default Album
