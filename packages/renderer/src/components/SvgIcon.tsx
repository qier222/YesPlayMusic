const SvgIcon = ({ name, className }: { name: string; className?: string }) => {
  const symbolId = `#icon-${name}`
  return (
    <svg aria-hidden='true' className={className}>
      <use href={symbolId} fill='currentColor' />
    </svg>
  )
}

export default SvgIcon
