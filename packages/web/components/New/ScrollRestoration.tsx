import { useLayoutEffect } from 'react'
import scrollPositions from '@/web/store/scrollPositions'
import { throttle } from 'lodash-es'

const ScrollRestoration = () => {
  useLayoutEffect(() => {
    const main = document.querySelector('main')
    const handleScroll = throttle(() => {
      scrollPositions.set(window.location.pathname, main?.scrollTop ?? 0)
    }, 100)
    main?.addEventListener('scroll', handleScroll)
    return () => {
      main?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return <></>
}

export default ScrollRestoration
