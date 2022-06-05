import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'
import Image from './Image'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'

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
  const navigate = useNavigate()

  const goTo = (id: number) => {
    if (albums) navigate(`/album/${id}`)
    if (playlists) navigate(`/playlist/${id}`)
  }

  const prefetch = (id: number) => {
    if (albums) prefetchAlbum({ id })
    if (playlists) prefetchPlaylist({ id })
  }

  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>
          {title}
        </h4>
      )}

      {/* Items */}
      <div className='grid grid-cols-3 gap-10 xl:grid-cols-4 2xl:grid-cols-5'>
        {albums?.map(album => (
          <Image
            onClick={() => goTo(album.id)}
            key={album.id}
            alt={album.name}
            src={resizeImage(album?.picUrl || '', 'md')}
            className='aspect-square rounded-24'
            onMouseOver={() => prefetch(album.id)}
          />
        ))}
        {playlists?.map(playlist => (
          <Image
            onClick={() => goTo(playlist.id)}
            key={playlist.id}
            alt={playlist.name}
            src={resizeImage(
              playlist.coverImgUrl || playlist?.picUrl || '',
              'md'
            )}
            className='aspect-square rounded-24'
            onMouseOver={() => prefetch(playlist.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default CoverRow
