import { useNavigate } from "react-router-dom"
import classNames from "classnames";

export interface ArtistInlineProps {
  /** 歌手名單。 */
  artists: Artist[],
  /** 額外要套進 {@link ArtistInline} 的 className。 */
  className?: string,
  /** 是否允許前往歌手頁面？ */
  disableLink?: boolean,
  /** 是否要在截斷第二位歌手的名字？ */
  clampLine?: boolean,
}

export interface ArtistInlineUIProps extends ArtistInlineProps {
  /** 點擊歌手時會觸發的事件 */
  onArtistClicked: (artist: Artist) => void,
}

/**
 * 歌手清單的純介面部分。
 */
export const ArtistInlineUI = ({
  artists,
  onArtistClicked,
  className,
  disableLink,
  clampLine = true,
}: ArtistInlineUIProps) => {
  if (!artists) return <div />

  return (
    <div className={classNames(clampLine && 'line-clamp-1', className)}>
      {/* 歌手 1, 歌手 2, 歌手 3⋯⋯ */}
      {artists.map((artist, index) => (
        <span key={`${artist.id}-${artist.name}`}>
          <span
            onClick={() => onArtistClicked(artist)}
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

/**
 * 歌手清單，含點下歌手名稱自動跳轉至
 * 歌手頁面的功能。
 */
export const ArtistInline = ({
  disableLink,
  ...props
}: ArtistInlineProps) => {
  const navigate = useNavigate()
  const handleClick = (artist: Artist) => {
    artist.id !== 0 && !disableLink && navigate(`/artist/${artist.id}`)
  }

  return <ArtistInlineUI disableLink={disableLink} onArtistClicked={handleClick} {...props} />
}

export default ArtistInline
