import { useState, useEffect, RefObject } from 'react'

const useIntersectionObserver = (element: RefObject<Element>): { onScreen: boolean } => {
  const [onScreen, setOnScreen] = useState(false)

  useEffect(() => {
    if (element.current) {
      const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
      observer.observe(element.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [element, setOnScreen])

  return {
    onScreen,
  }
}

export default useIntersectionObserver
