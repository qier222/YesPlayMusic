import { assign } from 'lodash-es'
import { proxy, ref } from 'valtio'

interface ContextMenu {
  target: HTMLElement | null
  cursorPosition: {
    x: number
    y: number
  } | null
  type: 'album' | 'track' | 'playlist' | 'artist' | null
  dataSourceID: string | number | null
  options: {
    useCursorPosition?: boolean
  } | null
}

const initContextMenu: ContextMenu = {
  target: null,
  cursorPosition: null,
  type: null,
  dataSourceID: null,
  options: null,
}

const contextMenus = proxy<ContextMenu>(initContextMenu)
export default contextMenus

export const openContextMenu = ({
  event,
  type,
  dataSourceID,
  options = null,
}: {
  event: React.MouseEvent<HTMLElement, MouseEvent>
  type: ContextMenu['type']
  dataSourceID: ContextMenu['dataSourceID']
  options?: ContextMenu['options']
}) => {
  const target = event.target as HTMLElement
  contextMenus.target = ref(target)

  contextMenus.type = type
  contextMenus.dataSourceID = dataSourceID
  contextMenus.options = options
  contextMenus.cursorPosition = {
    x: event.clientX,
    y: event.clientY,
  }
}

export const closeContextMenu = (event: MouseEvent) => {
  if (event.target === contextMenus.target) {
    return
  }
  assign(contextMenus, initContextMenu)
}
