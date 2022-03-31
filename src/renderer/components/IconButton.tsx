import React, { ReactNode } from 'react'
import classNames from 'classnames'
import type SvgIcon from '@/components/SvgIcon'

export interface IconButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  /**
   * 按鈕本身。
   *
   * 通常使用 {@link SvgIcon}。
   */
  children: ReactNode
}

/**
 * 只放圖示的按鈕。
 */
const IconButton = ({
  children,
  disabled,
  className,
  ...props
}: IconButtonProps) => (
  <button
    className={classNames(
      className,
      'relative transform cursor-default p-1.5 transition duration-200',
      !disabled &&
        'btn-pressed-animation btn-hover-animation after:bg-black/[.06] dark:after:bg-white/10',
      disabled && 'opacity-30'
    )}
    {...props}
  >
    {children}
  </button>
)

export default React.memo(IconButton)
