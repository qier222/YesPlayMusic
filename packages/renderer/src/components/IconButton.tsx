import { ReactNode } from 'react'

const IconButton = ({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean | undefined
  className?: string
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        className,
        'relative transform cursor-default p-2 transition duration-200',
        !disabled &&
          'btn-pressed-animation btn-hover-animation after:bg-black/[.06] dark:after:bg-white/10',
        disabled && 'opacity-30'
      )}
    >
      {children}
    </button>
  )
}

export default IconButton
