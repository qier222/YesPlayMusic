import SvgIcon from './SvgIcon'

const Topbar = () => {
  return (
    <div className='flex w-full items-center justify-between pt-11 pb-10'>
      {/* Left Part */}
      <div className='flex items-center'>
        {/* Navigation Buttons */}
        <button className='rounded-full bg-[#E9E9E9] p-[10px] dark:bg-[#0E0E0E]'>
          <SvgIcon name='back' className='h-7 w-7 text-[#717171]' />
        </button>
        <button className='ml-[10px] rounded-full bg-[#E9E9E9] p-[10px] dark:bg-[#0E0E0E]'>
          <SvgIcon name='forward' className='h-7 w-7 text-[#717171]' />
        </button>

        {/* Dividing line */}
        <div className='mx-6 h-4 w-px bg-black/20 dark:bg-white/20'></div>

        {/* Search Box */}
        <div className='flex min-w-[284px] items-center rounded-full bg-[#E9E9E9] p-[10px] text-[#717171] dark:bg-[#0E0E0E]'>
          <SvgIcon name='search' className='mr-[10px] h-7 w-7' />
          <input
            placeholder='Search Song Name'
            className='bg-transparent placeholder:text-[#717171]'
          />
        </div>
      </div>

      {/* Right Part */}
      <div className='flex'>
        <button className='rounded-full bg-[#E9E9E9] p-[10px] dark:bg-[#0E0E0E]'>
          <SvgIcon name='placeholder' className='h-7 w-7 text-[#717171]' />
        </button>

        {/* Avatar */}
        <div>
          <img
            className='ml-3 h-12 w-12 rounded-full'
            src='http://p1.music.126.net/AetIV1GOZiLKk1yy8PMPfw==/109951165378042240.jpg'
          />
        </div>
      </div>
    </div>
  )
}

export default Topbar
