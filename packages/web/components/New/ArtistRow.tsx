import { resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import Image from './Image'

const Artist = ({ artist }: { artist: Artist }) => {
  return (
    <div className='text-center'>
      <Image
        alt={artist.name}
        src={resizeImage(artist.img1v1Url, 'md')}
        className={cx(
          'aspect-square rounded-full',
          css`
            min-width: 96px;
            min-height: 96px;
          `
        )}
      />
      <div className='line-clamp-1 mt-2.5 text-12 font-medium text-neutral-700 dark:text-neutral-600 lg:text-14 lg:font-bold'>
        {artist.name}
      </div>
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
  title?: string
  className?: string
  placeholderRow?: number
}) => {
  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h4 className='mb-6 text-12 font-medium uppercase dark:text-neutral-300 lg:text-14 lg:font-bold'>
          {title}
        </h4>
      )}

      {/* Artists */}
      {artists && (
        <div className='no-scrollbar -ml-2.5 flex w-screen snap-x overflow-x-scroll lg:ml-auto lg:grid lg:w-auto lg:grid-cols-5 lg:gap-10'>
          {artists.map(artist => (
            <div
              className='mr-5 snap-start first-of-type:ml-2.5 last-of-type:mr-2.5 lg:mr-0'
              key={artist.id}
            >
              <Artist artist={artist} key={artist.id} />
            </div>
          ))}
        </div>
      )}

      {/* Placeholder */}
      {placeholderRow && !artists && (
        <div className='no-scrollbar -ml-2.5 flex w-screen overflow-x-scroll lg:ml-auto lg:grid lg:w-auto lg:grid-cols-5 lg:gap-10'>
          {[...new Array(placeholderRow * 5).keys()].map(i => (
            <div
              className='mr-5 first-of-type:ml-2.5 last-of-type:mr-2.5 lg:mr-0'
              key={i}
            >
              <div
                className='aspect-square w-full rounded-full bg-white dark:bg-neutral-800'
                style={{
                  minHeight: '96px',
                  minWidth: '96px',
                }}
              />
              <div className='mt-2.5 text-12 font-medium text-transparent lg:text-16 lg:font-bold'>
                PLACE
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArtistRow
