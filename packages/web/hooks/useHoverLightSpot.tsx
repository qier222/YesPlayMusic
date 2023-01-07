import { css, cx } from '@emotion/css'
import { motion, useMotionValue } from 'framer-motion'
import { RefObject, useEffect, useRef } from 'react'

const useHoverLightSpot = (
  config: { opacity: number; size: number } = { opacity: 0.8, size: 32 }
) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const opacity = useMotionValue(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const buttonX = useMotionValue(0)
  const buttonY = useMotionValue(0)

  useEffect(() => {
    if (!buttonRef.current) return
    const button = buttonRef.current
    const handleMouseOver = () => {
      opacity.set(config.opacity)
    }
    const handleMouseOut = () => {
      opacity.set(0)
      buttonX.set(0)
      buttonY.set(0)
    }
    const handleMouseMove = (event: MouseEvent) => {
      if (!buttonRef.current) return
      const spotSize = config.size / 2
      const button = buttonRef.current.getBoundingClientRect()
      const cursorX = event.clientX - button.x
      const cursorY = event.clientY - button.y
      const newSpotX = cursorX - spotSize
      const newSpotY = cursorY - spotSize
      x.set(newSpotX)
      y.set(newSpotY)
      buttonX.set((cursorX - button.width / 2) / 8)
      buttonY.set((cursorY - button.height / 2) / 8)
    }
    button.addEventListener('mouseover', handleMouseOver)
    button.addEventListener('mouseout', handleMouseOut)
    button.addEventListener('mousemove', handleMouseMove)
    return () => {
      button.removeEventListener('mouseover', handleMouseOver)
      button.removeEventListener('mouseout', handleMouseOut)
      button.removeEventListener('mousemove', handleMouseMove)
    }
  }, [buttonRef.current])

  const LightSpot = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        className={cx(
          'pointer-events-none absolute top-0 left-0 rounded-full transition-opacity duration-400',
          css`
            filter: blur(16px);
            background: rgb(255, 255, 255);
          `
        )}
        style={{ opacity, x, y, height: config.size, width: config.size }}
      ></motion.div>
    )
  }

  return {
    buttonRef,
    LightSpot,
    buttonStyle: {
      x: buttonX,
      y: buttonY,
    },
  }
}

export default useHoverLightSpot
