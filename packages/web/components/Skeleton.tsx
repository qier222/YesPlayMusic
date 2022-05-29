import { ReactNode } from 'react'
import { cx } from '@emotion/css'

const Skeleton = ({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cx(
        'relative animate-pulse bg-gray-100 text-transparent dark:bg-gray-800',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Skeleton
