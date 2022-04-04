import SvgIcon from './SvgIcon'

const TitleBar = () => {
  return (
    <div className='flex h-8 w-screen items-center justify-between bg-gray-50'>
      <div className='ml-2 text-sm text-gray-500'>YesPlayMusic</div>
      <div className='flex h-full'>
        <button className='flex w-[2.875rem] items-center justify-center hover:bg-[#e9e9e9]'>
          <SvgIcon className='h-3 w-3' name='windows-minimize' />
        </button>
        <button className='flex w-[2.875rem] items-center justify-center hover:bg-[#e9e9e9]'>
          <SvgIcon className='h-3 w-3' name='windows-maximize' />
        </button>
        <button className='flex w-[2.875rem] items-center justify-center hover:bg-[#c42b1c] hover:text-white'>
          <SvgIcon className='h-3 w-3' name='windows-close' />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
