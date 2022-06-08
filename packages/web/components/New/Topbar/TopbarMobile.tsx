import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'

const TopbarMobile = () => {
  return (
    <div className='mb-5 mt-7 flex'>
      <div className='flex-grow'>
        <SearchBox />
      </div>

      <div className='ml-6 flex'>
        <SettingsButton />
        <div className='ml-3'>
          <Avatar />
        </div>
      </div>
    </div>
  )
}

export default TopbarMobile
