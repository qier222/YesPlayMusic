import SvgIcon from '@/renderer/components/SvgIcon'

const Cover = ({
  imageUrl,
  onClick,
  roundedClass = 'rounded-xl',
  showPlayButton = false,
  showHover = true,
  alwaysShowShadow = false,
}: {
  imageUrl: string
  onClick?: () => void
  roundedClass?: string
  showPlayButton?: boolean
  showHover?: boolean
  alwaysShowShadow?: boolean
}) => {
  const [isError, setIsError] = useState(imageUrl.includes('3132508627578625'))

  return (
    <div onClick={onClick} className='group relative z-0'>
      {/* Neon shadow */}
      {showHover && (
        <div
          className={classNames(
            'absolute top-2 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] bg-cover  blur-lg filter transition duration-300 ',
            roundedClass,
            !alwaysShowShadow && 'opacity-0 group-hover:opacity-60'
          )}
          style={{
            backgroundImage: `url("${imageUrl}")`,
          }}
        ></div>
      )}

      {/* Cover */}
      {isError ? (
        <div className='box-content flex aspect-square h-full w-full items-center justify-center rounded-xl border border-black border-opacity-5  bg-gray-800 text-gray-300 '>
          <SvgIcon name='music-note' className='h-1/2 w-1/2' />
        </div>
      ) : (
        <img
          className={classNames(
            'box-content aspect-square h-full w-full border border-black border-opacity-5 dark:border-white  dark:border-opacity-[.03]',
            roundedClass
          )}
          src={imageUrl}
          onError={() => imageUrl && setIsError(true)}
        />
      )}

      {/* Play button */}
      {showPlayButton && (
        <div className='absolute top-0 hidden h-full w-full place-content-center group-hover:grid'>
          <button className='btn-pressed-animation grid h-11 w-11 cursor-default place-content-center rounded-full border border-white border-opacity-[.08] bg-white bg-opacity-[.14] text-white backdrop-blur backdrop-filter transition-all hover:bg-opacity-[.44]'>
            <SvgIcon className='ml-0.5 h-6 w-6' name='play-fill' />
          </button>
        </div>
      )}
    </div>
  )
}

export default Cover
