import { useState, useEffect } from 'react'

const hasFocus = () => typeof document !== 'undefined' && document.hasFocus()

const useWindowFocus = () => {
  const [focused, setFocused] = useState(hasFocus)

  useEffect(() => {
    setFocused(hasFocus())

    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)

    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return focused
}

export default useWindowFocus
