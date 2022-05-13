export type SvgName =
  | 'back'
  | 'dislike'
  | 'dj'
  | 'email'
  | 'explicit'
  | 'eye-off'
  | 'eye'
  | 'fm'
  | 'forward'
  | 'heart-outline'
  | 'heart'
  | 'home'
  | 'lock'
  | 'lyrics'
  | 'more'
  | 'music-library'
  | 'music-note'
  | 'next'
  | 'pause'
  | 'phone'
  | 'play-fill'
  | 'play'
  | 'playlist'
  | 'podcast'
  | 'previous'
  | 'qrcode'
  | 'repeat'
  | 'repeat-1'
  | 'search'
  | 'settings'
  | 'shuffle'
  | 'user'
  | 'volume-half'
  | 'volume-mute'
  | 'volume'
  | 'windows-close'
  | 'windows-minimize'
  | 'windows-maximize'
  | 'windows-un-maximize'
  | 'x'

const SvgIcon = ({
  name,
  className,
}: {
  name: SvgName
  className?: string
}) => {
  const symbolId = `#icon-${name}`
  return (
    <svg aria-hidden='true' className={className}>
      <use href={symbolId} fill='currentColor' />
    </svg>
  )
}

export default SvgIcon
