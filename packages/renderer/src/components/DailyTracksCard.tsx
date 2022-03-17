import SvgIcon from '@/components/SvgIcon'
import style from './DailyTracksCard.module.scss'

const DailyTracksCard = () => {
  return (
    <div className='relative h-[198px] cursor-pointer overflow-hidden rounded-2xl'>
      {/*  Cover  */}
      <img
        className={classNames(
          'absolute top-0 left-0 w-full will-change-transform',
          style.animation
        )}
        src='https://p2.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg?param=1024y1024'
      />

      {/* 每日推荐 */}
      <div className='absolute flex h-full w-1/2 items-center bg-gradient-to-r from-[#0000004d] to-transparent pl-8'>
        <div className='grid grid-cols-2 grid-rows-2 gap-2 text-[64px] font-semibold leading-[64px] text-white opacity-[96]'>
          {Array.from('每日推荐').map(word => (
            <div key={word}>{word}</div>
          ))}
        </div>
      </div>

      {/* Play button */}
      <button className='btn-pressed-animation absolute right-6 bottom-6 grid h-11 w-11 cursor-default place-content-center rounded-full border border-white border-opacity-[.08] bg-white bg-opacity-[.14] text-white backdrop-blur backdrop-filter transition-all hover:bg-opacity-[.44]'>
        <SvgIcon name='play' className='ml-1 h-4 w-4' />
      </button>
    </div>
  )
}

export default DailyTracksCard
