import Button, { Color as ButtonColor } from '@/web/components/Button'
import Icon from '@/web/components/Icon'
import Cover from '@/web/components/Cover'
import useArtist from '@/web/api/hooks/useArtist'
import useArtistAlbums from '@/web/api/hooks/useArtistAlbums'
import { resizeImage } from '@/web/utils/common'
import dayjs from 'dayjs'
import TracksGrid from '@/web/components/TracksGrid'
import CoverRow, { Subtitle } from '@/web/components/CoverRow'
import Skeleton from '@/web/components/Skeleton'
import useTracks from '@/web/api/hooks/useTracks'
import player from '@/web/states/player'
import { cx } from '@emotion/css'
import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

const Header = ({ artist }: { artist: Artist | undefined }) => {
  const coverImage = resizeImage(artist?.img1v1Url || '', 'md')

  return (
    <>
      <div className='absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden'>
        {coverImage && (
          <>
            <img src={coverImage} className='absolute w-full blur-[100px]' />
            <img src={coverImage} className='absolute w-full blur-[100px]' />
          </>
        )}
        <div className='absolute top-0 h-full w-full bg-gradient-to-b from-white/[.85] to-white dark:from-black/50 dark:to-[#1d1d1d]'></div>
      </div>

      <div className='relative mt-6 overflow-hidden rounded-2xl bg-gray-500/10 dark:bg-gray-800/20'>
        <div className='flex h-[26rem] justify-center overflow-hidden'>
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
        </div>

        <div className='absolute right-0 left-0 top-[18rem] h-32 bg-gradient-to-t  from-[#222]/60 to-transparent'></div>

        <div className='absolute top-0 right-0 left-0 flex h-[26rem] items-end justify-between p-8 pb-6'>
          <div className='text-7xl font-bold text-white'>{artist?.name}</div>
        </div>
      </div>
    </>
  )
}

const LatestRelease = ({
  album,
  isLoading,
}: {
  album: Album | undefined
  isLoading: boolean
}) => {
  const navigate = useNavigate()
  const toAlbum = () => navigate(`/album/${album?.id}`)
  return (
    <div>
      <div className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white'>
        最新发行
      </div>
      <div className='flex-grow rounded-xl'>
        {isLoading ? (
          <Skeleton className='aspect-square w-full rounded-xl'></Skeleton>
        ) : (
          <Cover
            imageUrl={resizeImage(album?.picUrl ?? '', 'md')}
            showPlayButton={true}
            onClick={toAlbum}
          />
        )}
        <div
          onClick={toAlbum}
          className='line-clamp-2  line-clamp-1 mt-2 font-semibold leading-tight decoration-gray-600 decoration-2 hover:underline  dark:text-white dark:decoration-gray-200'
        >
          {album?.name}
        </div>
        <div className='text-[12px] text-gray-500 dark:text-gray-400'>
          {album?.type} · {dayjs(album?.publishTime || 0).year()}
        </div>
      </div>
    </div>
  )
}

const PopularTracks = ({
  tracks,
  isLoadingArtist,
}: {
  tracks: Track[] | undefined
  isLoadingArtist: boolean
}) => {
  const { data: tracksWithExtraInfo } = useTracks({
    ids: tracks?.slice(0, 10)?.map(t => t.id) ?? [],
  })

  const handlePlay = useCallback(
    (trackID: number | null = null) => {
      if (!tracks?.length) {
        toast('无法播放歌单')
        return
      }
      player.playAList(
        tracks.map(t => t.id),
        trackID
      )
    },
    [tracks]
  )

  return (
    <div>
      <div className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white'>
        热门歌曲
      </div>
      <div className='rounded-xl'>
        <TracksGrid
          tracks={tracksWithExtraInfo?.songs ?? tracks?.slice(0, 10) ?? []}
          isSkeleton={isLoadingArtist}
          onTrackDoubleClick={handlePlay}
        />
      </div>
    </div>
  )
}

const Artist = () => {
  const params = useParams()

  const { data: artist, isLoading: isLoadingArtist } = useArtist({
    id: Number(params.id) || 0,
  })

  const { data: albumsRaw, isLoading: isLoadingAlbums } = useArtistAlbums({
    id: Number(params.id) || 0,
    limit: 1000,
  })

  const albums = useMemo(() => {
    if (!albumsRaw?.hotAlbums) return []
    const albums: Album[] = []
    albumsRaw.hotAlbums.forEach(album => {
      if (album.type !== '专辑') return false
      if (['混音版', '精选集', 'Remix'].includes(album.subType)) return false

      // No singles
      if (album.size <= 1) return false

      // No remixes
      if (
        /(\(|\[)(.*)(Remix|remix)(.*)(\)|\])/.test(
          album.name.toLocaleLowerCase()
        )
      ) {
        return false
      }

      // If have same name album only keep the Explicit version
      const sameNameAlbumIndex = albums.findIndex(a => a.name === album.name)
      if (sameNameAlbumIndex !== -1) {
        if (album.mark === 1056768) albums[sameNameAlbumIndex] = album
        return
      }

      albums.push(album)
    })
    return albums
  }, [albumsRaw?.hotAlbums])

  const singles = useMemo(() => {
    if (!albumsRaw?.hotAlbums) return []
    const albumsIds = albums.map(album => album.id)
    return albumsRaw.hotAlbums.filter(
      album => albumsIds.includes(album.id) === false
    )
  }, [albums, albumsRaw?.hotAlbums])

  return (
    <div>
      <Header artist={artist?.artist} />

      <div
        className={cx(
          'mt-12 px-2',
          albumsRaw?.hotAlbums?.length !== 0 &&
            'grid h-[20rem] grid-cols-[14rem,_auto] grid-rows-1 gap-16'
        )}
      >
        {albumsRaw?.hotAlbums?.length !== 0 && (
          <LatestRelease
            album={albumsRaw?.hotAlbums[0]}
            isLoading={isLoadingAlbums}
          />
        )}

        <PopularTracks
          tracks={artist?.hotSongs}
          isLoadingArtist={isLoadingArtist}
        />
      </div>

      {/* Albums */}
      {albums.length !== 0 && (
        <div className='mt-20 px-2'>
          <div className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white'>
            专辑
          </div>
          <CoverRow
            albums={albums.slice(0, 10)}
            subtitle={Subtitle.TypeReleaseYear}
          />
        </div>
      )}

      {/* Singles/EP */}
      {singles.length !== 0 && (
        <div className='mt-16 px-2'>
          <div className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white'>
            单曲和EP
          </div>
          <CoverRow
            albums={singles.slice(0, 5)}
            subtitle={Subtitle.TypeReleaseYear}
          />
        </div>
      )}
    </div>
  )
}

export default Artist
