export interface ContextMenuPosition {
  x: number
  y: number
  transformOrigin?: `origin-${'top' | 'bottom'}-${'left' | 'right'}`
}

export interface ContextMenuItem {
  type: 'item' | 'submenu' | 'divider'
  label?: string | null
  onClick?: (e: MouseEvent) => void
  items?: ContextMenuItem[]
}
