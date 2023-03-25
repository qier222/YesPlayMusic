import { css, cx } from '@emotion/css'
import { ForwardedRef, forwardRef, useRef, useState } from 'react'
import Icon from '../Icon'
import { ContextMenuItem } from './types'

const MenuItem = ({
  item,
  index,
  onClose,
  onSubmenuOpen,
  onSubmenuClose,
  className,
}: {
  item: ContextMenuItem
  index: number
  onClose: (e: MouseEvent) => void
  onSubmenuOpen: (props: { itemRect: DOMRect; index: number }) => void
  onSubmenuClose: () => void
  className?: string
}) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const [isHover, setIsHover] = useState(false)

  if (item.type === 'divider') {
    return (
      <div className='my-2 h-px w-full px-3'>
        <div className='h-full w-full bg-white/20'></div>
      </div>
    )
  }

  return (
    <div
      ref={itemRef}
      onClick={e => {
        if (!item.onClick) {
          return
        }
        const event = e as unknown as MouseEvent
        item.onClick?.(event)
        onClose(event)
      }}
      onMouseOver={() => {
        if (item.type !== 'submenu') return
        setIsHover(true)
        onSubmenuOpen({
          itemRect: itemRef.current!.getBoundingClientRect(),
          index,
        })
      }}
      onMouseLeave={e => {
        const relatedTarget = e.relatedTarget as HTMLElement | null
        if (relatedTarget?.classList?.contains('submenu')) {
          return
        }
        setIsHover(false)
        onSubmenuClose()
      }}
      className={cx(
        'relative cursor-default',
        className,
        css`
          padding-right: 9px;
          padding-left: 9px;
        `
      )}
    >
      <div
        className={cx(
          'relative flex w-full items-center justify-between whitespace-nowrap rounded-[5px] p-3 text-16 font-medium text-neutral-200 transition-colors duration-400 hover:bg-white/[.06]',
          item.type !== 'submenu' && !isHover && 'active:bg-gray/50',
          isHover && 'bg-white/[.06]'
        )}
      >
        <div>{item.label}</div>
        {item.type === 'submenu' && (
          <>
            <Icon
              name='caret-right'
              className={cx(
                'ml-10 text-neutral-600',
                css`
                  height: 8px;
                  width: 5px;
                `
              )}
            />

            {/* 将item变宽一点，避免移动鼠标时还没移动到submenu就关闭submenu了 */}
            <div
              className={cx(
                'absolute h-full',
                css`
                  left: -24px;
                  width: calc(100% + 48px);
                `
              )}
            ></div>

            {/* 增加三角形，避免斜着移动到submenu时意外关闭菜单 */}
            <div className='absolute -right-8 -bottom-6 h-12 w-12 rotate-45'></div>
            <div className='absolute -right-8 -top-6 h-12 w-12 rotate-45'></div>
          </>
        )}
      </div>
    </div>
  )
}

export default MenuItem
