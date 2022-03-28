const ArtistInline = ({
  artists,
  className,
  disableLink,
  clampLine = true,
}: {
  artists: Artist[]
  className?: string
  disableLink?: boolean
  clampLine?: boolean
}) => {
  if (!artists) return <div></div>

  const navigate = useNavigate()
  const handleClick = (id: number) => {
    id !== 0 && !disableLink && navigate(`/artist/${id}`)
  }

  return (
    <div className={classNames(clampLine && 'line-clamp-1', className)}>
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
