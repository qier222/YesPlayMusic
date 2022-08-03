import Icon from '../../Icon'

const Actions = ({
  onPlay,
  onLike,
  isLiked,
}: {
  isLiked?: boolean
  onPlay: () => void
  onLike?: () => void
}) => {
  return (
    <div className='mt-11 flex items-end justify-between lg:mt-4 lg:justify-start'>
      <div className='flex items-end'>
        {/* Menu */}
        <button className='mr-2.5 flex h-14 w-14 items-center justify-center rounded-full text-white/40 transition  duration-400 hover:text-white/70 dark:bg-white/10 hover:dark:bg-white/30'>
          <Icon name='more' className='h-7 w-7' />
        </button>
        {/* Like */}
        {onLike && (
          <button
            onClick={() => onLike()}
            className='flex h-14 w-14 items-center justify-center rounded-full text-white/40 transition  duration-400 hover:text-white/70 dark:bg-white/10 hover:dark:bg-white/30 lg:mr-2.5'
          >
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              className='h-7 w-7'
            />
          </button>
        )}
      </div>
      <button
        onClick={() => onPlay()}
        className='h-14 rounded-full px-10 text-18 font-medium text-white dark:bg-brand-700'
      >
        Play
      </button>
    </div>
  )
}

export default Actions
