import Button, { Color as ButtonColor } from '@/components/Button'
import SvgIcon from '@/components/SvgIcon'
import Cover from '@/components/Cover'
import useArtist from '@/hooks/useArtist'
import useArtistAlbums from '@/hooks/useArtistAlbums'
import { resizeImage } from '@/utils/common'
import dayjs from 'dayjs'
import TracksGrid from '@/components/TracksGrid'
import CoverRow, { Subtitle } from '@/components/CoverRow'
import Skeleton from '@/components/Skeleton'
import { Fragment } from 'react'

const Artist = () => {
  const params = useParams()

  const { data: artist, isLoading } = useArtist({
    id: Number(params.id) || 0,
  })

  const { data: albumsRaw, isLoading: isLoadingAlbum } = useArtistAlbums({
    id: Number(params.id) || 0,
    limit: 1000,
  })

  const albums = useMemo(() => {
    if (!albumsRaw?.hotAlbums) return []
    return albumsRaw.hotAlbums.filter(
      album =>
        album.type === '专辑' &&
        ['混音版', '精选集', 'Remix'].includes(album.subType) === false &&
        album.size > 1
    )
  }, [albumsRaw?.hotAlbums])

  const singles = useMemo(() => {
    if (!albumsRaw?.hotAlbums) return []
    return albumsRaw.hotAlbums.filter(
      album =>
        album.type !== '专辑' ||
        ['混音版', '精选集', 'Remix'].includes(album.subType) ||
        album.size === 1
    )
  }, [albumsRaw?.hotAlbums])

  const latestAlbum = useMemo(() => {
    if (!albumsRaw || !albumsRaw.hotAlbums) return
    return albumsRaw.hotAlbums[0]
  }, [albumsRaw])

  const coverImage = resizeImage(artist?.artist?.img1v1Url || '', 'md')

  return (
    <div>
      <div className='absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden'>
        {coverImage && (
          <Fragment>
            <img
              src={coverImage}
              className='absolute -top-full w-full blur-[100px]'
            />
            <img
              src={coverImage}
              className='absolute -top-full w-full blur-[100px]'
            />
          </Fragment>
        )}
        <div className='absolute top-0 h-full w-full bg-gradient-to-b from-white/[.84] to-white dark:from-black/[.6] dark:to-[#1d1d1d]'></div>
      </div>

      {/* Header */}
      <div className='relative mt-6 overflow-hidden rounded-2xl'>
        <div className='flex h-[26rem] justify-center overflow-hidden'>
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
          <img src={coverImage} className='aspect-square brightness-[.5]' />
        </div>

        <div className='absolute right-0 left-0 top-[18rem] h-32 bg-gradient-to-t  from-[#222]/60 to-transparent'></div>

        <div className='absolute top-0 right-0 left-0 flex h-[26rem] items-end justify-between p-8 pb-6'>
          <div className='text-7xl font-bold text-white'>
            {artist?.artist.name}
          </div>
        </div>
      </div>

      <div className='mt-12 grid h-[20rem] grid-cols-[14rem,_auto] grid-rows-1 gap-16 px-2'>
        {/* Latest release */}
        <div>
          <div className='mb-6 text-2xl font-semibold dark:text-white'>
            最新发行
          </div>
          <div className='flex-grow rounded-xl '>
            {isLoadingAlbum ? (
              <Skeleton className='aspect-square w-full rounded-xl'></Skeleton>
            ) : (
              <Cover imageUrl={latestAlbum?.picUrl ?? ''} />
            )}
            <div className='line-clamp-2  line-clamp-1 mt-2 font-semibold leading-tight decoration-gray-600 decoration-2 hover:underline  dark:text-white dark:decoration-gray-200'>
              {latestAlbum?.name}
            </div>
            <div className='text-[12px] text-gray-500 dark:text-gray-400'>
              {latestAlbum?.type} ·{' '}
              {dayjs(latestAlbum?.publishTime || 0).year()}
            </div>
          </div>
        </div>

        {/* Popular tracks */}
        <div>
          <div className='mb-6 text-2xl font-semibold dark:text-white'>
            热门歌曲
          </div>
          <div className='overflow-scroll rounded-xl '>
            <TracksGrid
              tracks={artist?.hotSongs.slice(0, 10) ?? []}
              isSkeleton={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Albums */}
      <div className='mt-20 px-2'>
        <div className='mb-6 text-2xl font-semibold dark:text-white'>专辑</div>
        <CoverRow
          albums={albums.slice(0, 10)}
          subtitle={Subtitle.TYPE_RELEASE_YEAR}
        />
      </div>

      {/* Singles/EP */}
      <div className='mt-16 px-2'>
        <div className='mb-6 text-2xl font-semibold dark:text-white'>
          单曲和EP
        </div>
        <CoverRow
          albums={singles.slice(0, 5)}
          subtitle={Subtitle.TYPE_RELEASE_YEAR}
        />
      </div>
    </div>
  )
}

export default Artist
