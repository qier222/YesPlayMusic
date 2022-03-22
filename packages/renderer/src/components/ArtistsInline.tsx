const ArtistInline = ({
  artists,
  className,
  disableLink,
}: {
  artists: Artist[]
  className?: string
  disableLink?: boolean
}) => {
  if (!artists) return <div></div>

  const navigate = useNavigate()
  const handleClick = (id: number) => {
    !id || disableLink ? null : navigate(`/artist/${id}`)
  }

  return (
    <div className={classNames('line-clamp-1', className)}>
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
