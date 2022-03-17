import style from './Slider.module.scss'

const Slider = () => {
  const [value, setValue] = useState(50)

  const thumbStyle = useMemo(
    () => ({
      left: `${value}%`,
      transform: `translate(-${value}%, -9px)`,
    }),
    [value]
  )

  const usedTrackStyle = useMemo(
    () => ({
      width: `${value}%`,
    }),
    [value]
  )

  const onDragging = false

  const [isHover, setIsHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className='absolute h-[2px] w-full bg-gray-500 bg-opacity-10'></div>
      <div
        className={classNames(
          'absolute h-[2px]',
          onDragging || isHover ? 'bg-brand-500' : 'bg-gray-500'
        )}
        style={usedTrackStyle}
      ></div>

      <div
        className={classNames(
          'absolute flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 bg-opacity-20',
          !onDragging && !isHover && 'opacity-0'
        )}
        style={thumbStyle}
      >
        <div className='absolute h-2 w-2 rounded-full bg-brand-500'></div>
      </div>

      <input
        type='range'
        min='0'
        max='100'
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className='absolute h-[2px] w-full appearance-none opacity-0'
      />
    </div>
  )
}

export default Slider
