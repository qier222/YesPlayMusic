const ArtistInline = ({
  artists,
  className,
}: {
  artists: Artist[]
  className?: string
}) => {
  if (!artists) return <div></div>

  return (
    <div className={classNames('flex truncate', className)}>
      {artists.map((artist, index) => (
        <span key={artist.id}>
          <span className={classNames({ 'hover:underline': artist.id })}>
            {artist.name}
          </span>
          {index < artists.length - 1 ? ', ' : ''}&nbsp;
        </span>
      ))}
    </div>
  )
}

export default ArtistInline
