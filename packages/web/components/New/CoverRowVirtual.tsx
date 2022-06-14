import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'
import Image from './Image'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CSSProperties, useRef } from 'react'

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
  containerClassName,
  containerStyle,
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

  // The scrollable element for your list
  const parentRef = useRef<HTMLDivElement>(null)

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

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    overscan: 5,
    estimateSize: () => {
      const containerWidth = parentRef.current?.clientWidth
      console.log(parentRef.current?.clientWidth)
      if (!containerWidth) {
        return 192
      }
      const gridGapY = 24
      const gridGapX = 40
      const gridColumns = 4
      console.log(
        (containerWidth - (gridColumns - 1) * gridGapX) / gridColumns + gridGapY
      )
      return (
        (containerWidth - (gridColumns - 1) * gridGapX) / gridColumns + gridGapY
      )
    },
  })

  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>
          {title}
        </h4>
      )}

      <div
        ref={parentRef}
        className={cx('w-full overflow-auto', containerClassName)}
        style={containerStyle}
      >
        <div
          className='relative w-full'
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((row: any) => (
            <div
              key={row.index}
              className='absolute top-0 left-0 grid w-full grid-cols-4 gap-4 lg:gap-10'
              style={{
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}
            >
              {rows[row.index].map((item: Item) => (
                <img
                  onClick={() => goTo(item.id)}
                  key={item.id}
                  alt={item.name}
                  src={resizeImage(
                    item?.picUrl ||
                      (item as Playlist)?.coverImgUrl ||
                      item?.picUrl ||
                      '',
                    'md'
                  )}
                  className='aspect-square rounded-24'
                  onMouseOver={() => prefetch(item.id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoverRow
