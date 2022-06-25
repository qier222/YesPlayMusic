import { colord } from 'colord'
import { getCoverColor } from '../utils/common'
import { useState, useEffect } from 'react'

export default function useCoverColor(url: string) {
  const [color, setColor] = useState({ from: '#000', to: '#000' })

  useEffect(() => {
    getCoverColor(url || '').then(color => {
      if (!color) return
      const to = colord(color).darken(0.15).rotate(-5).toHex()
      setColor({ from: color, to })
    })
  }, [url])

  return color
}
