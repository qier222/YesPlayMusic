import { resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import Image from './Image'
import { prefetchArtist } from '@/web/api/hooks/useArtist'

const Artist = ({ artist }: { artist: Artist }) => {
  const navigate = useNavigate()
  const to = () => {
    navigate(`/artist/${artist.id}`)
  }

  return (
    <div className='text-center' onMouseOver={() => prefetchArtist({ id: artist.id })}>
      <Image
        onClick={to}
        src={resizeImage(artist.img1v1Url, 'md')}
        className={cx(
          'aspect-square rounded-full',
          css`
            min-width: 96px;
            min-height: 96px;
          `
        )}
      />
      <div
        onClick={to}
        className='line-clamp-1 mt-2.5 text-12 font-medium text-neutral-700 dark:text-neutral-600 lg:text-14 lg:font-bold'
      >
        {artist.name}
      </div>
    </div>
  )
}

const Placeholder = ({ row }: { row: number }) => {
  return (
    <div className='no-scrollbar flex snap-x overflow-x-scroll lg:grid lg:w-auto lg:grid-cols-5 lg:gap-10'>
      {[...new Array(row * 5).keys()].map(i => (
        <div className='flex snap-start flex-col items-center px-2.5 lg:px-0' key={i}>
          <div
            className='aspect-square w-full rounded-full bg-white dark:bg-neutral-800'
            style={{
              minHeight: '96px',
              minWidth: '96px',
            }}
          />
          <div className='line-clamp-1 mt-2.5 w-1/2 rounded-full text-12 font-medium text-transparent dark:bg-neutral-800 lg:text-14 lg:font-bold'>
            NAME
          </div>
        </div>
      ))}
    </div>
  )
}

const ArtistRow = ({
  artists,
  title,
  className,
  placeholderRow,
}: {
  artists: Artist[] | undefined
  title?: string | null
  className?: string
  placeholderRow?: number
}) => {
  return (
    <div className={cx('@container', className)}>
      {/* Title */}
      {title && (
        <h4 className='mx-2.5 mb-6 text-12 font-medium uppercase dark:text-neutral-300 lg:mx-0 lg:text-14 lg:font-bold'>
          {title}
        </h4>
      )}

      {/* Artists */}
      {artists && (
        <div className='no-scrollbar grid w-auto grid-cols-4 gap-x-10 gap-y-8 @3xl:grid-cols-5 @7xl:grid-cols-7'>
          {artists.map(artist => (
            <div className='snap-start px-2.5 lg:px-0' key={artist.id}>
              <Artist artist={artist} key={artist.id} />
            </div>
          ))}
        </div>
      )}

      {/* Placeholder */}
      {placeholderRow && !artists && <Placeholder row={placeholderRow} />}
    </div>
  )
}

const memoizedArtistRow = memo(ArtistRow)
memoizedArtistRow.displayName = 'ArtistRow'
export default memoizedArtistRow
