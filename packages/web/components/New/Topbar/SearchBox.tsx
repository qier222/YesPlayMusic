import { css, cx } from '@emotion/css'
import Icon from '../../Icon'

const SearchBox = () => {
  return (
    <div className='app-region-no-drag flex items-center rounded-full bg-day-600 p-2.5 text-neutral-500 dark:bg-night-600 lg:min-w-[284px]'>
      <Icon name='search' className='mr-2.5 h-7 w-7' />
      <input
        placeholder='Artist, songs and more'
        className='bg-transparent font-medium  placeholder:text-neutral-500 dark:text-neutral-200'
      />
    </div>
  )
}

export default SearchBox
