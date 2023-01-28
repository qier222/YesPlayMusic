import { css, cx } from '@emotion/css'
import Icon from '../Icon'
import { breakpoint as bp } from '@/web/utils/const'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSearchSuggestions } from '@/web/api/search'
import { SearchApiNames } from '@/shared/api/Search'
import { useClickAway, useDebounce } from 'react-use'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const SearchSuggestions = ({
  searchText,
  isInputFocused,
}: {
  searchText: string
  isInputFocused: boolean
}) => {
  const navigate = useNavigate()

  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  useDebounce(() => setDebouncedSearchText(searchText), 500, [searchText])
  const { data: suggestions } = useQuery(
    [SearchApiNames.FetchSearchSuggestions, debouncedSearchText],
    () => fetchSearchSuggestions({ keywords: debouncedSearchText }),
    {
      enabled: debouncedSearchText.length > 0,
      keepPreviousData: true,
    }
  )

  const suggestionsArray = useMemo(() => {
    if (suggestions?.code !== 200) {
      return []
    }
    const suggestionsArray: {
      name: string
      type: 'album' | 'artist' | 'track'
      id: number
    }[] = []
    const rawItems = [
      ...(suggestions.result.artists || []),
      ...(suggestions.result.albums || []),
      ...(suggestions.result.songs || []),
    ]
    rawItems.forEach(item => {
      const type = (item as Artist).albumSize
        ? 'artist'
        : (item as Track).duration
        ? 'track'
        : 'album'
      suggestionsArray.push({
        name: item.name,
        type,
        id: item.id,
      })
    })
    return suggestionsArray
  }, [suggestions])

  const [clickedSearchText, setClickedSearchText] = useState('')
  useEffect(() => {
    if (clickedSearchText !== searchText) {
      setClickedSearchText('')
    }
  }, [clickedSearchText, searchText])

  const panelRef = useRef<HTMLDivElement>(null)
  useClickAway(panelRef, () => setClickedSearchText(searchText))

  return (
    <AnimatePresence>
      {isInputFocused &&
        searchText.length > 0 &&
        suggestionsArray.length > 0 &&
        !clickedSearchText &&
        searchText === debouncedSearchText && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scaleY: 0.96 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              transition: {
                duration: 0.1,
              },
            }}
            exit={{
              opacity: 0,
              scaleY: 0.96,
              transition: {
                duration: 0.2,
              },
            }}
            className={cx(
              'absolute mt-2 origin-top rounded-24 border border-white/10 bg-white/10 p-2 backdrop-blur-3xl',
              css`
                width: 286px;
              `
            )}
          >
            {suggestionsArray?.map(suggestion => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className='line-clamp-1 rounded-12 p-2 text-white hover:bg-white/10'
                onClick={() => {
                  setClickedSearchText(searchText)
                  if (['album', 'artist'].includes(suggestion.type)) {
                    navigate(`${suggestion.type}/${suggestion.id}`)
                  }
                  if (suggestion.type === 'track') {
                    // TODO: play song
                  }
                }}
              >
                {suggestion.type} -{suggestion.name}
              </div>
            ))}
          </motion.div>
        )}
    </AnimatePresence>
  )
}

const SearchBox = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='relative'>
      {/* Input */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cx(
          'app-region-no-drag flex cursor-text items-center rounded-full bg-white/10 p-2.5 text-white/40 backdrop-blur-3xl',
          css`
            ${bp.lg} {
              min-width: 284px;
            }
          `
        )}
      >
        <Icon name='search' className='mr-2.5 h-7 w-7' />
        <input
          ref={inputRef}
          placeholder={t`search.search`}
          className={cx(
            'flex-shrink bg-transparent font-medium  placeholder:text-white/40 dark:text-white/80',
            css`
              @media (max-width: 420px) {
                width: 142px;
              }
            `
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            navigate(`/search/${searchText}`)
          }}
        />
      </div>

      <SearchSuggestions searchText={searchText} isInputFocused={isFocused} />
    </div>
  )
}

export default SearchBox
