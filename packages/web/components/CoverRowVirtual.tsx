import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { Virtuoso } from 'react-virtuoso'
import { CSSProperties } from 'react'

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
  containerClassName?: string
  containerStyle?: CSSProperties
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

  type Item = Album | Playlist
  const items: Item[] = albums || playlists || []
  const rows = items.reduce((rows: Item[][], item: Item, index: number) => {
    const rowIndex = Math.floor(index / 4)
    if (rows.length < rowIndex + 1) {
      rows.push([item])
    } else {
      rows[rowIndex].push(item)
    }
    return rows
  }, [])

  return (
    <div className={className}>
      {/* Title */}
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      <Virtuoso
        className='no-scrollbar'
        style={{
          height: 'calc(100vh - 132px)',
        }}
        data={rows}
        overscan={5}
        itemSize={el => el.getBoundingClientRect().height + 24}
        totalCount={rows.length}
        components={{
          Header: () => <div className='h-16'></div>,
          Footer: () => <div className='h-16'></div>,
        }}
        itemContent={(index, row) => (
          <div key={index} className='grid w-full grid-cols-4 gap-4 lg:mb-6 lg:gap-6'>
            {row.map((item: Item) => (
              <img
                onClick={() => goTo(item.id)}
                key={item.id}
                alt={item.name}
                src={resizeImage(
                  item?.picUrl || (item as Playlist)?.coverImgUrl || item?.picUrl || '',
                  'md'
                )}
                className='aspect-square w-full rounded-24'
                onMouseOver={() => prefetch(item.id)}
              />
            ))}
          </div>
        )}
      />
    </div>
  )
}

export default CoverRow
