// Inspired by https://github.com/vueuse/vueuse
import { throttle as lodashThrottle } from 'lodash-es'
import { useEffect, useState } from 'react'

interface ArrivedState {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
}

interface Offset {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

const useScroll = (
  ref: React.RefObject<HTMLDivElement> | HTMLElement | null,
  { offset, throttle }: { offset?: Offset; throttle?: number } = {}
) => {
  const [scroll, setScroll] = useState<{
    x: number
    y: number
    arrivedState: ArrivedState
  }>({
    x: 0,
    y: 0,
    arrivedState: {
      top: true,
      bottom: false,
      left: false,
      right: false,
    },
  })

  useEffect(() => {
    if (!ref) return
    const handleScroll = (e: Event) => {
      if (!e.target) return
      const target = e.target as HTMLElement

      const arrivedState: ArrivedState = {
        left: target.scrollLeft <= 0 + (offset?.left || 0),
        right: target.scrollLeft + target.clientWidth >= target.scrollWidth - (offset?.right || 0),
        top: target.scrollTop <= 0 + (offset?.top || 0),
        bottom:
          target.scrollTop + target.clientHeight >= target.scrollHeight - (offset?.bottom || 0),
      }

      setScroll({
        x: target.scrollLeft,
        y: target.scrollTop,
        arrivedState,
      })
    }

    const readHandleScroll = throttle ? lodashThrottle(handleScroll, throttle) : handleScroll

    const element = 'current' in ref ? ref?.current : ref
    element?.addEventListener('scroll', readHandleScroll)
    return () => element?.removeEventListener('scroll', readHandleScroll)
  }, [offset?.bottom, offset?.left, offset?.right, offset?.top, ref, throttle])

  return scroll
}

export default useScroll
