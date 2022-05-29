import { resizeImage } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import Image from './Image'

const ArtistRow = ({
  artists,
  title,
  className,
}: {
  artists: Artist[] | undefined
  title?: string
  className?: string
}) => {
  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>
          {title}
        </h4>
      )}

      {/* Artists */}
      <div className='grid grid-cols-5 gap-10'>
        {artists?.map(artist => (
          <div key={artist.id} className='text-center'>
            <Image
              alt={artist.name}
              src={resizeImage(artist.img1v1Url, 'md')}
              className='aspect-square rounded-full'
            />
            <div className='line-clamp-1 mt-2.5 text-14 font-bold text-neutral-700 dark:text-neutral-600'>
              {artist.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ArtistRow
