import classNames from 'classnames'
import React from 'react'

export type SkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={classNames(
      'relative animate-pulse bg-gray-100 text-transparent dark:bg-gray-800',
      className
    )}
    {...props}
  />
)

export default Skeleton
