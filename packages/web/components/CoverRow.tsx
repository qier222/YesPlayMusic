import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'
import Image from './Image'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { memo, useCallback } from 'react'
import dayjs from 'dayjs'
import ArtistInline from './ArtistsInLine'

type ItemTitle = undefined | 'name'
type ItemSubTitle = undefined | 'artist' | 'year'

const Album = ({
  album,
  itemTitle,
  itemSubtitle,
}: {
  album: Album
  itemTitle?: ItemTitle
  itemSubtitle?: ItemSubTitle
}) => {
  const navigate = useNavigate()
  const goTo = () => {
    navigate(`/album/${album.id}`)
  }
  const prefetch = () => {
    prefetchAlbum({ id: album.id })
  }

  const title =
    itemTitle &&
    {
      name: album.name,
    }[itemTitle]

  const subtitle =
    itemSubtitle &&
    {
      artist: (
        <ArtistInline
          artists={album.artists}
          hoverClassName='hover:text-white/50 transition-colors duration-400'
        />
      ),
      year: dayjs(album.publishTime || 0).year(),
    }[itemSubtitle]

  return (
    <div>
      <Image
        onClick={goTo}
        key={album.id}
        src={resizeImage(album?.picUrl || '', 'md')}
        className='aspect-square rounded-24'
        onMouseOver={prefetch}
      />
      {title && (
        <div className='line-clamp-2 mt-2 text-14 font-medium text-neutral-300'>{title}</div>
      )}
      {subtitle && <div className='mt-1 text-14 font-medium text-neutral-700'>{subtitle}</div>}
    </div>
  )
}

const Playlist = ({ playlist }: { playlist: Playlist }) => {
  const navigate = useNavigate()
  const goTo = useCallback(() => {
    navigate(`/playlist/${playlist.id}`)
  }, [navigate, playlist.id])
  const prefetch = useCallback(() => {
    prefetchPlaylist({ id: playlist.id })
  }, [playlist.id])

  return (
    <div className='group relative'>
      <Image
        onClick={goTo}
        key={playlist.id}
        src={resizeImage(playlist.coverImgUrl || playlist?.picUrl || '', 'md')}
        className='aspect-square rounded-24'
        onMouseOver={prefetch}
      />
      {/* Hover mask layer */}
      <div className='pointer-events-none absolute inset-0 w-full bg-gradient-to-b from-transparent to-black opacity-0 transition-all duration-400 group-hover:opacity-100 '></div>
      {/* Name */}
      <div className='pointer-events-none absolute bottom-0 p-3 text-sm font-medium  text-neutral-300 opacity-0 transition-all duration-400 group-hover:opacity-100'>
        {playlist.name}
      </div>
    </div>
  )
}

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
  itemTitle,
  itemSubtitle,
}: {
  title?: string
  className?: string
  albums?: Album[]
  playlists?: Playlist[]
  itemTitle?: ItemTitle
  itemSubtitle?: ItemSubTitle
}) => {
  return (
    <div className={cx('@container', className)}>
      {/* Title */}
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      {/* Items */}
      <div className='grid grid-cols-3 gap-4 @lg:gap-6 @4xl:grid-cols-4 @7xl:grid-cols-5'>
        {albums?.map(album => (
          <Album key={album.id} album={album} itemTitle={itemTitle} itemSubtitle={itemSubtitle} />
        ))}
        {playlists?.map(playlist => (
          <Playlist key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  )
}

const memoizedCoverRow = memo(CoverRow)
memoizedCoverRow.displayName = 'CoverRow'
export default memoizedCoverRow
