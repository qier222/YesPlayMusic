import { css, cx } from '@emotion/css'
import Image from './Image'
import { resizeImage } from '@/web/utils/common'
import useBreakpoint from '@/web/hooks/useBreakpoint'
import { useNavigate } from 'react-router-dom'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'

const CoverWall = ({
  albums,
}: {
  albums: { id: number; coverUrl: string; large: boolean }[]
}) => {
  const navigate = useNavigate()
  const breakpoint = useBreakpoint()
  const sizes = {
    small: {
      sm: 'sm',
      md: 'sm',
      lg: 'sm',
      xl: 'sm',
      '2xl': 'md',
    },
    large: {
      sm: 'sm',
      md: 'sm',
      lg: 'md',
      xl: 'md',
      '2xl': 'lg',
    },
  } as const

  return (
    <div
      className={cx(
        'grid w-full grid-flow-row-dense grid-cols-4 lg:grid-cols-8',
        css`
          gap: 13px;
        `
      )}
    >
      {albums.map(album => (
        <Image
          src={resizeImage(
            album.coverUrl,
            sizes[album.large ? 'large' : 'small'][breakpoint]
          )}
          key={album.id}
          alt='Album Cover'
          placeholder={null}
          className={cx(
            'aspect-square h-full w-full rounded-20 lg:rounded-24',
            album.large && 'col-span-2 row-span-2'
          )}
          onClick={() => navigate(`/album/${album.id}`)}
          onMouseOver={() => prefetchAlbum({ id: album.id })}
        />
      ))}
    </div>
  )
}

export default CoverWall
