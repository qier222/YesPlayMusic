const ArtistInline = ({
  artists,
  className,
}: {
  artists: Artist[]
  className?: string
}) => {
  if (!artists) return <div></div>

  return (
    <div className={classNames('line-clamp-1', className)}>
      {artists.map((artist, index) => (
        <span key={artist.name}>
          <span className={classNames({ 'hover:underline': !!artist.id })}>
            {artist.name}
          </span>
          {index < artists.length - 1 ? ', ' : ''}&nbsp;
        </span>
      ))}
    </div>
  )
}

export default ArtistInline
