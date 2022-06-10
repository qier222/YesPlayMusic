import { css } from '@emotion/css'
import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'

const TopbarMobile = () => {
  return (
    <div className='mb-5 mt-7 flex px-2.5'>
      <div className='flex-grow'>
        <SearchBox />
      </div>

      <div className='ml-6 flex flex-shrink-0'>
        <SettingsButton />
        <div className='ml-3'>
          <Avatar />
        </div>
      </div>
    </div>
  )
}

export default TopbarMobile
