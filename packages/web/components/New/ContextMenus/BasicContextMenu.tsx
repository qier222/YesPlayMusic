import { css, cx } from '@emotion/css'
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useClickAway } from 'react-use'
import Icon from '../../Icon'
import useLockMainScroll from '@/web/hooks/useLockMainScroll'
import { motion } from 'framer-motion'
import useMeasure from 'react-use-measure'

interface ContextMenuItem {
  type: 'item' | 'submenu' | 'divider'
  label?: string
  onClick?: (e: MouseEvent) => void
  items?: ContextMenuItem[]
}

const Divider = () => (
  <div className='my-2 h-px w-full  px-3'>
    <div className='h-full w-full bg-white/5'></div>
  </div>
)

const Item = ({
  item,
  onClose,
}: {
  item: ContextMenuItem
  onClose: (e: MouseEvent) => void
}) => {
  const [isHover, setIsHover] = useState(false)

  const itemRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const getSubmenuPosition = () => {
    if (!itemRef.current || !submenuRef.current) {
      return { x: 0, y: 0 }
    }
    const item = itemRef.current.getBoundingClientRect()
    const submenu = submenuRef.current.getBoundingClientRect()

    const isRightSide = item.x + item.width + submenu.width <= window.innerWidth
    const x = isRightSide ? item.x + item.width : item.x - submenu.width

    const isTopSide = item.y - 8 + submenu.height <= window.innerHeight
    const y = isTopSide ? item.y - 8 : item.y + item.height + 8 - submenu.height

    const transformOriginTable = {
      top: {
        right: 'origin-top-left',
        left: 'origin-top-right',
      },
      bottom: {
        right: 'origin-bottom-left',
        left: 'origin-bottom-right',
      },
    } as const

    return {
      x,
      y,
      transformOrigin:
        transformOriginTable[isTopSide ? 'top' : 'bottom'][
          isRightSide ? 'right' : 'left'
        ],
    }
  }

  if (item.type === 'divider') return <Divider />
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
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className='relative px-2'
    >
      <div className='flex w-full items-center justify-between whitespace-nowrap rounded-md px-3 py-2 text-white/70 transition-colors duration-400 hover:bg-white/10 hover:text-white/80'>
        <div>{item.label}</div>
        {item.type === 'submenu' && (
          <Icon name='more' className='ml-8 h-4 w-4' />
        )}
        {item.type === 'submenu' && item.items && (
          <Menu
            position={{ x: 99999, y: 99999 }}
            items={item.items}
            ref={submenuRef}
            onClose={onClose}
            forMeasure={true}
          />
        )}
        {item.type === 'submenu' && item.items && isHover && (
          <Menu
            position={getSubmenuPosition()}
            items={item.items}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

const Menu = forwardRef(
  (
    {
      position,
      items,
      onClose,
      forMeasure,
    }: {
      position: {
        x: number
        y: number
        transformOrigin?:
          | 'origin-top-left'
          | 'origin-top-right'
          | 'origin-bottom-left'
          | 'origin-bottom-right'
      }
      items: ContextMenuItem[]
      onClose: (e: MouseEvent) => void
      forMeasure?: boolean
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: forMeasure ? 1 : 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.1,
          },
        }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        ref={ref}
        className={cx(
          'fixed z-10 rounded-12 border border-day-500 bg-day-600 py-2 font-medium',
          position.transformOrigin || 'origin-top-left'
        )}
        style={{ left: position.x, top: position.y }}
      >
        {items.map((item, index) => (
          <Item key={index} item={item} onClose={onClose} />
        ))}
      </motion.div>
    )
  }
)
Menu.displayName = 'Menu'

const BasicContextMenu = ({
  onClose,
  items,
  target,
  cursorPosition,
  options,
}: {
  onClose: (e: MouseEvent) => void
  items: ContextMenuItem[]
  target: HTMLElement
  cursorPosition: { x: number; y: number }
  options?: {
    useCursorPosition?: boolean
  } | null
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [measureRef, menu] = useMeasure()

  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  )

  useClickAway(menuRef, onClose)
  useLockMainScroll(!!position)

  useLayoutEffect(() => {
    if (options?.useCursorPosition) {
      const leftX = cursorPosition.x
      const rightX = cursorPosition.x - menu.width
      const bottomY = cursorPosition.y
      const topY = cursorPosition.y - menu.height
      const position = {
        x: leftX + menu.width < window.innerWidth ? leftX : rightX,
        y: bottomY + menu.height < window.innerHeight ? bottomY : topY,
      }
      setPosition(position)
    } else {
      const button = target.getBoundingClientRect()
      const leftX = button.x
      const rightX = button.x - menu.width + button.width
      const bottomY = button.y + button.height + 8
      const topY = button.y - menu.height - 8
      const position = {
        x: leftX + menu.width < window.innerWidth ? leftX : rightX,
        y: bottomY + menu.height < window.innerHeight ? bottomY : topY,
      }
      setPosition(position)
    }
  }, [target, menu, options?.useCursorPosition, cursorPosition])

  return (
    <>
      <Menu
        position={{ x: 99999, y: 99999 }}
        items={items}
        ref={measureRef}
        onClose={onClose}
        forMeasure={true}
      />
      {position && (
        <Menu
          position={position}
          items={items}
          ref={menuRef}
          onClose={onClose}
        />
      )}
    </>
  )
}

export default BasicContextMenu
