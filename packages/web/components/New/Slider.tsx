import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { cx } from '@emotion/css'

const Slider = ({
  value,
  min,
  max,
  onChange,
  onlyCallOnChangeAfterDragEnded = false,
  orientation = 'horizontal',
  alwaysShowThumb = false,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  onlyCallOnChangeAfterDragEnded?: boolean
  orientation?: 'horizontal' | 'vertical'
  alwaysShowTrack?: boolean
  alwaysShowThumb?: boolean
}) => {
  const sliderRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggingValue, setDraggingValue] = useState(value)
  const memoedValue = useMemo(
    () =>
      isDragging && onlyCallOnChangeAfterDragEnded ? draggingValue : value,
    [isDragging, draggingValue, value, onlyCallOnChangeAfterDragEnded]
  )

  /**
   * Get the value of the slider based on the position of the pointer
   */
  const getNewValue = useCallback(
    (pointer: { x: number; y: number }) => {
      if (!sliderRef?.current) return 0
      const slider = sliderRef.current.getBoundingClientRect()
      const newValue =
        orientation === 'horizontal'
          ? ((pointer.x - slider.x) / slider.width) * max
          : ((slider.height - (pointer.y - slider.y)) / slider.height) * max
      if (newValue < min) return min
      if (newValue > max) return max
      return newValue
    },
    [sliderRef, max, min, orientation]
  )

  /**
   * Handle slider click event
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) =>
      onChange(getNewValue({ x: e.clientX, y: e.clientY })),
    [getNewValue, onChange]
  )

  /**
   * Handle pointer down event
   */
  const handlePointerDown = () => {
    setIsDragging(true)
  }

  /**
   * Handle pointer move events
   */
  useEffect(() => {
    const handlePointerMove = (e: { clientX: number; clientY: number }) => {
      if (!isDragging) return
      const newValue = getNewValue({ x: e.clientX, y: e.clientY })
      onlyCallOnChangeAfterDragEnded
        ? setDraggingValue(newValue)
        : onChange(newValue)
    }
    document.addEventListener('pointermove', handlePointerMove)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
    }
  }, [
    isDragging,
    onChange,
    setDraggingValue,
    onlyCallOnChangeAfterDragEnded,
    getNewValue,
  ])

  /**
   * Handle pointer up events
   */
  useEffect(() => {
    const handlePointerUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      if (onlyCallOnChangeAfterDragEnded) {
        onChange(draggingValue)
      }
    }
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [
    isDragging,
    setIsDragging,
    onlyCallOnChangeAfterDragEnded,
    draggingValue,
    onChange,
  ])

  /**
   * Track and thumb styles
   */
  const usedTrackStyle = useMemo(() => {
    const percentage = `${(memoedValue / max) * 100}%`
    return orientation === 'horizontal'
      ? { width: percentage }
      : { height: percentage }
  }, [max, memoedValue, orientation])
  const thumbStyle = useMemo(() => {
    const percentage = `${(memoedValue / max) * 100}%`
    return orientation === 'horizontal'
      ? { left: percentage }
      : { bottom: percentage }
  }, [max, memoedValue, orientation])

  return (
    <div
      className={cx(
        'group relative flex items-center',
        orientation === 'horizontal' && 'h-2',
        orientation === 'vertical' && 'h-full w-2 flex-col'
      )}
      ref={sliderRef}
      onClick={handleClick}
    >
      {/* Track */}
      <div
        className={cx(
          'absolute overflow-hidden rounded-full bg-black/10 bg-opacity-10 dark:bg-white/10',
          orientation === 'horizontal' && 'h-[3px] w-full',
          orientation === 'vertical' && 'h-full w-[3px]'
        )}
      >
        {/* Passed track */}
        <div
          className={cx(
            'bg-black dark:bg-white',
            orientation === 'horizontal' && 'h-full rounded-r-full',
            orientation === 'vertical' && 'bottom-0 w-full rounded-t-full'
          )}
          style={usedTrackStyle}
        ></div>
      </div>

      {/* Thumb */}
      <div
        className={cx(
          'absolute flex h-2 w-2 items-center justify-center rounded-full bg-black bg-opacity-20 transition-opacity dark:bg-white',
          isDragging || alwaysShowThumb
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100',
          orientation === 'horizontal' && '-translate-x-1',
          orientation === 'vertical' && 'translate-y-1'
        )}
        style={thumbStyle}
        onClick={e => e.stopPropagation()}
        onPointerDown={handlePointerDown}
      ></div>
    </div>
  )
}

export default Slider
