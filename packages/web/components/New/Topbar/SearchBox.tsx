import { css, cx } from '@emotion/css'
import Icon from '../../Icon'
import { breakpoint as bp } from '@/web/utils/const'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const SearchBox = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')

  return (
    <div
      className={cx(
        'app-region-no-drag flex items-center rounded-full bg-white/10 p-2.5 text-white/40 backdrop-blur-3xl',
        css`
          ${bp.lg} {
            min-width: 284px;
          }
        `
      )}
    >
      <Icon name='search' className='mr-2.5 h-7 w-7' />
      <input
        placeholder='Search'
        className={cx(
          'flex-shrink bg-transparent font-medium  placeholder:text-white/40 dark:text-white/80',
          css`
            @media (max-width: 420px) {
              width: 142px;
            }
          `
        )}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onKeyDown={e => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          navigate(`/search/${searchText}`)
        }}
      />
    </div>
  )
}

export default SearchBox
