const Slider = ({
  value,
  min,
  max,
  onChange,
  onlyCallOnChangeAfterDragEnded = false,
  orientation = 'horizontal',
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  onlyCallOnChangeAfterDragEnded?: boolean
  orientation?: 'horizontal' | 'vertical'
}) => {
  console.log('[Slider.tsx] rendering')

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
    (val: number) => {
      if (!sliderRef?.current) return 0
      const sliderWidth = sliderRef.current.getBoundingClientRect().width
      const newValue = (val / sliderWidth) * max
      if (newValue < min) return min
      if (newValue > max) return max
      return newValue
    },
    [sliderRef, max, min]
  )

  /**
   * Handle slider click event
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onChange(getNewValue(e.clientX))
    },
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
      const newValue = getNewValue(e.clientX)
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
        console.log('draggingValue', draggingValue)
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
  const usedTrackStyle = useMemo(
    () => ({ width: `${(memoedValue / max) * 100}%` }),
    [max, memoedValue]
  )
  const thumbStyle = useMemo(
    () => ({
      left: `${(memoedValue / max) * 100}%`,
      transform: `translateX(-10px)`,
    }),
    [max, memoedValue]
  )

  return (
    <div
      className="group flex h-2 -translate-y-[3px] items-center"
      ref={sliderRef}
      onClick={handleClick}
    >
      {/* Track */}
      <div className="absolute h-[2px] w-full bg-gray-500 bg-opacity-10"></div>

      {/* Passed track */}
      <div
        className={classNames(
          'absolute h-[2px] group-hover:bg-brand-500',
          isDragging ? 'bg-brand-500' : 'bg-gray-500 dark:bg-gray-400'
        )}
        style={usedTrackStyle}
      ></div>

      {/* Thumb */}
      <div
        className={classNames(
          'absolute flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 bg-opacity-20 transition-opacity ',
          isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        style={thumbStyle}
        onClick={e => e.stopPropagation()}
        onPointerDown={handlePointerDown}
      >
        <div className="absolute h-2 w-2 rounded-full bg-brand-500"></div>
      </div>
    </div>
  )
}

export default Slider
