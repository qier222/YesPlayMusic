import { NavLink } from 'react-router-dom'
import useArtistAlbums from '@/web/api/hooks/useArtistAlbums'
import { cx } from '@emotion/css'
import CoverRow from '@/web/components/CoverRow'
import { useMemo } from 'react'

const MoreByArtist = ({ album }: { album?: Album }) => {
  const { data: albums } = useArtistAlbums({
    id: album?.artist?.id || 0,
    limit: 1000,
  })

  const filteredAlbums = useMemo((): Album[] => {
    if (!albums) return []
    const allReleases = albums?.hotAlbums || []
    const filteredAlbums = allReleases.filter(
      album =>
        ['专辑', 'EP/Single', 'EP'].includes(album.type) && album.size > 1
    )
    const singles = allReleases.filter(
      album => album.type === 'Single' || album.size === 1
    )

    const qualifiedAlbums = [...filteredAlbums, ...singles]

    const formatName = (name: string) =>
      name.toLowerCase().replace(/(\s|deluxe|edition|\(|\))/g, '')

    const uniqueAlbums: Album[] = []
    qualifiedAlbums.forEach(a => {
      // 去除当前页面的专辑
      if (formatName(a.name) === formatName(album?.name ?? '')) return

      // 去除重复的专辑(包含 deluxe edition 的专辑会视为重复)
      if (
        uniqueAlbums.findIndex(aa => {
          return formatName(a.name) === formatName(aa.name)
        }) !== -1
      ) {
        return
      }

      // 去除 remix 专辑
      if (
        a.name.toLowerCase().includes('remix)') ||
        a.name.toLowerCase().includes('remixes)')
      ) {
        return
      }

      uniqueAlbums.push(a)
    })

    return uniqueAlbums.slice(0, 4)
  }, [album?.name, albums])

  return (
    <div>
      {/* Dividing line */}
      <div className={cx('mx-2.5 my-7.5 h-px bg-white/10 lg:mx-0')}></div>

      {/* Title */}
      <div className='mx-2.5 mb-5 text-14 font-bold text-neutral-300 lg:mx-0'>
        {album?.artist.name ? (
          <>
            MORE BY{' '}
            <NavLink
              to={`/artist/${album?.artist.id}`}
              className='transition duration-300 ease-in-out hover:text-neutral-100'
            >
              {album.artist.name}
            </NavLink>
          </>
        ) : (
          <span className='inline-block h-full rounded-full bg-white/10 text-transparent'>
            MORE BY PLACEHOLDER
          </span>
        )}
      </div>

      <CoverRow
        albums={filteredAlbums}
        itemTitle='name'
        itemSubtitle='year'
        className='mx-2.5 lg:mx-0'
      />
    </div>
  )
}

export default MoreByArtist
