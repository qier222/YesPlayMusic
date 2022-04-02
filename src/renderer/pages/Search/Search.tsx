import {
  multiMatchSearch,
  search,
  SearchApiNames,
  SearchTypes,
} from '@/api/search'
import Cover from '@/components/Cover'
import TrackGrid from '@/components/TracksGrid'
import { player } from '@/store'
import { resizeImage } from '@/utils/common'

const Artists = ({ artists }: { artists: Artist[] }) => {
  const navigate = useNavigate()
  return (
    <>
      {artists.map(artist => (
        <div
          onClick={() => navigate(`/artist/${artist.id}`)}
          key={artist.id}
          className='btn-hover-animation flex items-center p-2.5 after:rounded-xl after:bg-gray-100 dark:after:bg-white/10'
        >
          <div className='mr-4 h-14 w-14'>
            <Cover
              imageUrl={resizeImage(artist.img1v1Url, 'xs')}
              roundedClass='rounded-full'
              showHover={false}
            />
          </div>
          <div>
            <div className='text-lg font-semibold dark:text-white'>
              {artist.name}
            </div>
            <div className='mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400'>
              艺人
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const Albums = ({ albums }: { albums: Album[] }) => {
  const navigate = useNavigate()
  return (
    <>
      {albums.map(album => (
        <div
          onClick={() => navigate(`/album/${album.id}`)}
          key={album.id}
          className='btn-hover-animation flex items-center p-2.5 after:rounded-xl after:bg-gray-100 dark:after:bg-white/10'
        >
          <div className='mr-4 h-14 w-14'>
            <Cover
              imageUrl={resizeImage(album.picUrl, 'xs')}
              roundedClass='rounded-lg'
              showHover={false}
            />
          </div>
          <div>
            <div className='text-lg font-semibold dark:text-white'>
              {album.name}
            </div>
            <div className='mt-0.5 text-sm font-medium text-gray-500  dark:text-gray-400'>
              专辑 · {album?.artist.name} · 2020
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const Search = () => {
  const { keywords = '', type = 'ALL' } = useParams()

  const searchType: keyof typeof SearchTypes =
    type.toUpperCase() in SearchTypes
      ? (type.toUpperCase() as keyof typeof SearchTypes)
      : 'ALL'

  const { data: bestMatchRaw, isLoading: isLoadingBestMatch } = useQuery(
    [SearchApiNames.MULTI_MATCH_SEARCH, keywords],
    () => multiMatchSearch({ keywords })
  )

  const bestMatch = useMemo(() => {
    if (!bestMatchRaw?.result) return []
    return bestMatchRaw.result.orders
      .filter(order => ['album', 'artist'].includes(order)) // 暂时只支持专辑和艺人
      .map(order => {
        return bestMatchRaw.result[order][0]
      })
      .slice(0, 2)
  }, [bestMatchRaw?.result])

  const { data: searchResult, isLoading: isLoadingSearchResult } = useQuery(
    [SearchApiNames.SEARCH, keywords, searchType],
    () => search({ keywords, type: searchType })
  )

  const handlePlayTracks = useCallback(
    (trackID: number | null = null) => {
      const tracks = searchResult?.result.song.songs
      if (!tracks?.length) {
        toast('无法播放歌单')
        return
      }
      player.playAList(
        tracks.map(t => t.id),
        trackID
      )
    },
    [searchResult?.result.song.songs]
  )

  const navigate = useNavigate()
  const navigateBestMatch = (match: Artist | Album) => {
    if ((match as Artist).albumSize !== undefined) {
      navigate(`/artist/${match.id}`)
      return
    }
    if ((match as Album).artist !== undefined) {
      navigate(`/album/${match.id}`)
      return
    }
  }

  return (
    <div>
      <div className='mt-6 mb-8 text-4xl font-semibold dark:text-white'>
        <span className='text-gray-500'>搜索</span> &quot;{keywords}&quot;
      </div>

      {/* Best match */}
      {bestMatch.length !== 0 && (
        <div className='mb-6'>
          <div className='mb-2 text-sm font-medium text-gray-400'>最佳匹配</div>
          <div className='grid grid-cols-2'>
            {bestMatch.map(match => (
              <div
                onClick={() => navigateBestMatch(match)}
                key={`${match.id}${match.picUrl}`}
                className='btn-hover-animation flex items-center p-3 after:rounded-xl after:bg-gray-100 dark:after:bg-white/10'
              >
                <div className='mr-6 h-24 w-24'>
                  <Cover
                    imageUrl={resizeImage(match.picUrl, 'xs')}
                    showHover={false}
                    roundedClass='rounded-full'
                  />
                </div>
                <div>
                  <div className='text-xl font-semibold dark:text-white'>
                    {match.name}
                  </div>
                  <div className='mt-0.5 font-medium text-gray-500 dark:text-gray-400'>
                    {(match as Artist).occupation === '歌手' ? '艺人' : '专辑'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search result */}
      <div className='grid grid-cols-2 gap-6'>
        {searchResult?.result.artist.artists && (
          <div>
            <div className='mb-2 text-sm font-medium text-gray-400'>艺人</div>
            <Artists artists={searchResult.result.artist.artists} />
          </div>
        )}

        {searchResult?.result.album.albums && (
          <div>
            <div className='mb-2 text-sm font-medium text-gray-400'>专辑</div>
            <Albums albums={searchResult.result.album.albums} />
          </div>
        )}

        {searchResult?.result.song.songs && (
          <div className='col-span-2'>
            <div className='mb-2 text-sm font-medium text-gray-400'>歌曲</div>
            <TrackGrid
              tracks={searchResult.result.song.songs}
              cols={3}
              onTrackDoubleClick={handlePlayTracks}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
