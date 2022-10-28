import { useNavigate } from 'react-router-dom'
import { cx } from '@emotion/css'
import { openContextMenu } from '@/web/states/contextMenus'

const ArtistInline = ({
  artists,
  className,
  disableLink,
  onClick,
  hoverClassName,
}: {
  artists: Artist[]
  className?: string
  hoverClassName?: string
  disableLink?: boolean
  onClick?: (artistId: number) => void
}) => {
  const navigate = useNavigate()
  const handleClick = (id: number) => {
    if (id === 0 || disableLink) return
    if (!onClick) {
      navigate(`/artist/${id}`)
    } else {
      onClick(id)
    }
  }

  if (!artists) return <div></div>

  return (
    <div
      className={cx(
        !className?.includes('line-clamp') && 'line-clamp-1',
        className
      )}
    >
      {artists.map((artist, index) => (
        <span key={`${artist.id}-${artist.name}`}>
          <span
            onClick={() => handleClick(artist.id)}
            onContextMenu={event => {
              openContextMenu({
                event,
                type: 'artist',
                dataSourceID: artist.id,
                options: {
                  useCursorPosition: true,
                },
              })
            }}
            className={cx(!!artist.id && !disableLink && hoverClassName)}
          >
            {artist.name}
          </span>
          {index < artists.length - 1 ? ', ' : ''}&nbsp;
        </span>
      ))}
    </div>
  )
}

export default ArtistInline
