import classNames from 'classnames'
import { ReactNode } from 'react'

export enum Color {
  Primary = 'primary',
  Gray = 'gray',
}

export enum Shape {
  Default = 'default',
  Square = 'square',
}

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** 按鈕裡面的元素 */
  children: ReactNode
  /** 按鈕的背景顏色。 */
  backgroundColor?: Color
  /** 按鈕的文字顏色。 */
  textColor?: Color
  /** 是否進入骨架載入模式？ */
  isSkelton?: boolean
}

const Button = ({
  backgroundColor = Color.Primary,
  textColor = Color.Primary,
  isSkelton = false,
  onClick,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={classNames(
      'btn-pressed-animation flex cursor-default items-center rounded-lg  px-4 py-1.5 text-lg font-medium',
      {
        'bg-brand-100 dark:bg-brand-600': backgroundColor === Color.Primary,
        'text-brand-500 dark:text-white': textColor === Color.Primary,
        'bg-gray-100 dark:bg-gray-700': backgroundColor === Color.Gray,
        'text-gray-600 dark:text-gray-400': textColor === Color.Gray,
        'animate-pulse bg-gray-100 !text-transparent dark:bg-gray-800':
          isSkelton,
      }
    )}
    onClick={!isSkelton ? onClick : undefined}
  />
)

export default Button
