import { ReactNode } from 'react'
import cx from 'classnames'

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
      disabled={disabled}
      className={cx(
        className,
        'relative transform cursor-default p-1.5 transition duration-200',
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
