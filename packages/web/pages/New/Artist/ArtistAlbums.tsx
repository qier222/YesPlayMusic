import useArtistAlbums from '@/web/api/hooks/useArtistAlbums'
import CoverRow from '@/web/components/New/CoverRow'
import React from 'react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

const ArtistAlbum = () => {
  const params = useParams()

  const { data: albumsRaw, isLoading: isLoadingAlbums } = useArtistAlbums({
    id: Number(params.id) || 0,
    limit: 1000,
  })

  const pages = useMemo(() => {
    const pages: Album[][] = []
    albumsRaw?.hotAlbums.forEach((album, index) => {
      const pageNo = Math.floor(index / 12)
      if (!pages[pageNo]) {
        pages[pageNo] = [album]
      } else {
        pages[pageNo].push(album)
      }
    })
    return pages
  }, [albumsRaw?.hotAlbums])

  return (
    <div>
      <div className='mb-4 mt-11 text-12 font-medium uppercase text-neutral-300'>
        Albums
      </div>

      <div className='no-scrollbar flex gap-6 overflow-y-hidden overflow-x-scroll'>
        {pages.map((page, index) => (
          <CoverRow
            key={index}
            albums={page}
            itemTitle='name'
            itemSubtitle='year'
            className='h-full w-full flex-shrink-0'
          />
        ))}
      </div>
    </div>
  )
}

const memoized = React.memo(ArtistAlbum)
memoized.displayName = 'ArtistAlbum'
export default memoized
