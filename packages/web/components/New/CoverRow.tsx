import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'
import Image from './Image'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { memo, useCallback } from 'react'

const Album = ({ album }: { album: Album }) => {
  const navigate = useNavigate()
  const goTo = () => {
    console.log('dsada')
    navigate(`/album/${album.id}`)
  }
  const prefetch = () => {
    prefetchAlbum({ id: album.id })
  }

  return (
    <Image
      onClick={goTo}
      key={album.id}
      src={resizeImage(album?.picUrl || '', 'md')}
      className='aspect-square rounded-24'
      onMouseOver={prefetch}
    />
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
    <Image
      onClick={goTo}
      key={playlist.id}
      src={resizeImage(playlist.coverImgUrl || playlist?.picUrl || '', 'md')}
      className='aspect-square rounded-24'
      onMouseOver={prefetch}
    />
  )
}

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
}: {
  title?: string
  className?: string
  albums?: Album[]
  playlists?: Playlist[]
}) => {
  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>
          {title}
        </h4>
      )}

      {/* Items */}
      <div className='grid grid-cols-3 gap-4 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5'>
        {albums?.map(album => (
          <Album key={album.id} album={album} />
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
