const ArtistInline = ({
  artists,
  className,
  disableLink,
  onClick,
}: {
  artists: Artist[]
  className?: string
  disableLink?: boolean
  onClick?: (artistId: number) => void
}) => {
  if (!artists) return <div></div>

  const navigate = useNavigate()
  const handleClick = (id: number) => {
    if (id === 0 || disableLink) return
    if (!onClick) {
      navigate(`/artist/${id}`)
    } else {
      onClick(id)
    }
  }

  return (
    <div
      className={classNames(
        !className?.includes('line-clamp') && 'line-clamp-1',
        className
      )}
    >
      {artists.map((artist, index) => (
        <span key={`${artist.id}-${artist.name}`}>
          <span
            onClick={() => handleClick(artist.id)}
            className={classNames({
              'hover:underline': !!artist.id && !disableLink,
            })}
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
