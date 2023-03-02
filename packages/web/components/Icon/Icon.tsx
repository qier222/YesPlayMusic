import { IconNames } from './iconNamesType'

const Icon = ({
  name,
  className,
  style,
}: {
  name: IconNames
  className?: string
  style?: React.CSSProperties
}) => {
  const symbolId = `#icon-${name}`
  return (
    <svg aria-hidden='true' className={className} style={style}>
      <use href={symbolId} fill='currentColor' />
    </svg>
  )
}

export default Icon
