import { css, cx } from '@emotion/css'
import {
  ForwardedRef,
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import MenuItem from './MenuItem'
import { ContextMenuItem, ContextMenuPosition } from './types'

interface PanelProps {
  position: ContextMenuPosition
  items: ContextMenuItem[]
  onClose: (e: MouseEvent) => void
  forMeasure?: boolean
  classNames?: string
  isSubmenu?: boolean
}

interface SubmenuProps {
  itemRect: DOMRect
  index: number
}

const MenuPanel = forwardRef(
  (
    { position, items, onClose, forMeasure, classNames, isSubmenu }: PanelProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [submenuProps, setSubmenuProps] = useState<SubmenuProps | null>(null)

    return (
      // Container (to add padding for submenus)
      <div
        ref={ref}
        className={cx(
          'fixed select-none',
          isSubmenu ? 'submenu z-30 px-1' : 'z-20'
        )}
        style={{ left: position.x, top: position.y }}
      >
        {/* The real panel */}
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
          className={cx(
            'rounded-12 border border-white/[.06] bg-gray-900/95 p-px py-2.5 shadow-xl outline outline-1 outline-black backdrop-blur-3xl',
            css`
              min-width: 200px;
            `,
            classNames,
            position.transformOrigin || 'origin-top-left'
          )}
        >
          {items.map((item, index) => (
            <MenuItem
              key={index}
              index={index}
              item={item}
              onClose={onClose}
              onSubmenuOpen={(props: SubmenuProps) => setSubmenuProps(props)}
              onSubmenuClose={() => setSubmenuProps(null)}
              className={isSubmenu ? 'submenu' : ''}
            />
          ))}
        </motion.div>

        {/* Submenu */}
        <SubMenu
          items={
            submenuProps?.index ? items[submenuProps?.index]?.items : undefined
          }
          itemRect={submenuProps?.itemRect}
          onClose={onClose}
        />
      </div>
    )
  }
)
MenuPanel.displayName = 'Menu'

export default MenuPanel

const SubMenu = ({
  items,
  itemRect,
  onClose,
}: {
  items?: ContextMenuItem[]
  itemRect?: DOMRect
  onClose: (e: MouseEvent) => void
}) => {
  const submenuRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState<{
    x: number
    y: number
    transformOrigin: `origin-${'top' | 'bottom'}-${'left' | 'right'}`
  }>()
  useLayoutEffect(() => {
    if (!itemRect || !submenuRef.current) {
      return
    }
    const item = itemRect
    const submenu = submenuRef.current.getBoundingClientRect()

    const isRightSide = item.x + item.width + submenu.width <= window.innerWidth
    const x = isRightSide ? item.x + item.width : item.x - submenu.width

    const isTopSide = item.y - 10 + submenu.height <= window.innerHeight
    const y = isTopSide
      ? item.y - 10
      : item.y + item.height + 10 - submenu.height

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

    setPosition({
      x,
      y,
      transformOrigin:
        transformOriginTable[isTopSide ? 'top' : 'bottom'][
          isRightSide ? 'right' : 'left'
        ],
    })
  }, [itemRect])

  if (!items || !itemRect) {
    return <></>
  }

  return (
    <>
      <MenuPanel
        position={{ x: 99999, y: 99999 }}
        items={items || []}
        ref={submenuRef}
        onClose={() => {
          // Do nothing
        }}
        forMeasure={true}
        isSubmenu={true}
      />
      <MenuPanel
        position={position || { x: 99999, y: 99999 }}
        items={items || []}
        onClose={onClose}
        isSubmenu={true}
      />
    </>
  )
}
