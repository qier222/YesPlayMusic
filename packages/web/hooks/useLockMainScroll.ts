import { useEffect } from 'react'

const useLockMainScroll = (lock: boolean) => {
  useEffect(() => {
    const main = document.querySelector('#main') as HTMLElement | null
    if (!main) {
      throw new Error('Main element not found')
    }

    if (lock) {
      main.style.overflow = 'hidden'
    } else {
      main.style.overflow = 'auto'
    }
    return () => {
      main.style.overflow = 'auto'
    }
  }, [lock])
}

export default useLockMainScroll
