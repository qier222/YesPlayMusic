import { colord } from 'colord'
import { getCoverColor } from '../utils/common'

export default function useCoverColor(url: string, fallbackColor?: string) {
  const [color, setColor] = useState({ from: '#fff', to: '#fff' })

  const updateColor = (color?: string) => {
    if (!color) return
    const to = colord(color).darken(0.15).rotate(-5).toHex()
    setColor({ from: color, to })
  }

  useEffect(() => {
    getCoverColor(url || '').then(color => {
      updateColor(color)
    })
    .catch(() => {
      updateColor(fallbackColor)
    })
  }, [url])

  return color
}
