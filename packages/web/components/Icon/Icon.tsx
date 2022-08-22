import { IconNames } from './iconNamesType'

const Icon = ({ name, className }: { name: IconNames; className?: string }) => {
  const symbolId = `#icon-${name}`
  return (
    <svg aria-hidden='true' className={className}>
      <use href={symbolId} fill='currentColor' />
    </svg>
  )
}

export default Icon
