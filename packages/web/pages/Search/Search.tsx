import { multiMatchSearch, search } from '@/web/api/search'
import player from '@/web/states/player'
import { resizeImage } from '@/web/utils/common'
import { SearchTypes, SearchApiNames } from '@/shared/api/Search'
import dayjs from 'dayjs'
import { useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import Image from '@/web/components/Image'
import { cx } from '@emotion/css'

const Artists = ({ artists }: { artists: Artist[] }) => {
  const navigate = useNavigate()
  return (
    <>
      {artists.map(artist => (
        <div
          onClick={() => navigate(`/artist/${artist.id}`)}
          key={artist.id}
          className='flex items-center py-2.5'
        >
          <img src={resizeImage(artist.img1v1Url, 'xs')} className='mr-4 h-14 w-14 rounded-full' />
          <div>
            <div className='text-lg font-semibold text-neutral-200'>{artist.name}</div>
            <div className='mt-0.5 text-sm font-semibold text-white/30'>艺人</div>
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
          className='flex items-center py-2.5 text-neutral-200'
        >
          <img src={resizeImage(album.picUrl, 'xs')} className='mr-4 h-14 w-14 rounded-lg' />
          <div>
            <div className='text-lg font-semibold text-neutral-200'>{album.name}</div>
            <div className='mt-0.5 text-sm font-semibold text-white/30'>
              专辑 · {album?.artist.name} · {dayjs(album.publishTime).year()}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const Track = ({
  track,
  isPlaying,
  onPlay,
}: {
  track?: Track
  isPlaying?: boolean
  onPlay: (id: number) => void
}) => {
  return (
    <div
      className='flex items-center justify-between'
      onClick={e => {
        if (e.detail === 2 && track?.id) onPlay(track.id)
      }}
    >
      {/* Cover */}
      <Image
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
        animation={false}
        placeholder={false}
      />

      {/* Track info */}
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium ',
            isPlaying ? 'text-brand-700' : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200  text-white/30'>
          {track?.ar.map(a => a.name).join(', ')}
        </div>
      </div>
    </div>
  )
}

const Search = () => {
  const { keywords = '', type = 'all' } = useParams()

  const searchType: keyof typeof SearchTypes =
    type.toUpperCase() in SearchTypes ? (type.toUpperCase() as keyof typeof SearchTypes) : 'All'

  const { data: bestMatchRaw, isLoading: isLoadingBestMatch } = useQuery(
    [SearchApiNames.MultiMatchSearch, keywords],
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
    [SearchApiNames.Search, keywords, searchType],
    () => search({ keywords, type: searchType })
  )

  const handlePlayTracks = useCallback(
    (trackID: number | null = null) => {
      const tracks = searchResult?.result?.song?.songs
      if (!tracks?.length) {
        toast('无法播放歌单')
        return
      }
      player.playAList(
        tracks.map(t => t.id),
        trackID
      )
    },
    [searchResult?.result?.song?.songs]
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
        <span className='text-white/40'>搜索</span> &quot;{keywords}&quot;
      </div>

      {/* Best match */}
      {bestMatch.length !== 0 && (
        <div className='mb-6'>
          {/* mx-2.5 mb-6 text-12 font-medium uppercase dark:text-neutral-300 lg:mx-0 lg:text-14
          lg:font-bold */}
          <div className='mb-2 text-14 font-bold uppercase text-neutral-300'>最佳匹配</div>
          <div className='grid grid-cols-2'>
            {bestMatch.map(match => (
              <div
                onClick={() => navigateBestMatch(match)}
                key={`${match.id}${match.picUrl}`}
                className='btn-hover-animation flex items-center py-3 after:rounded-xl after:bg-gray-100 dark:after:bg-white/10'
              >
                <img
                  src={resizeImage(match.picUrl, 'xs')}
                  className={cx(
                    'mr-6 h-20 w-20',
                    (match as Artist).occupation === '歌手' ? 'rounded-full' : 'rounded-xl'
                  )}
                />
                <div>
                  <div className='text-xl font-semibold text-neutral-200'>{match.name}</div>
                  <div className='mt-0.5 font-medium text-white/30'>
                    {(match as Artist).occupation === '歌手'
                      ? '艺人'
                      : `专辑 · ${(match as Album).artist.name} · ${dayjs(
                          match.publishTime
                        ).year()}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search result */}
      <div className='grid grid-cols-2 gap-6'>
        {searchResult?.result?.artist?.artists && (
          <div>
            <div className='mb-2 text-14 font-bold uppercase text-neutral-300'>艺人</div>
            <Artists artists={searchResult.result.artist.artists} />
          </div>
        )}

        {searchResult?.result?.album?.albums && (
          <div>
            <div className='mb-2 text-14 font-bold uppercase text-neutral-300'>专辑</div>
            <Albums albums={searchResult.result.album.albums} />
          </div>
        )}

        {searchResult?.result?.song?.songs && (
          <div className='col-span-2'>
            <div className='mb-2 text-14 font-bold uppercase text-neutral-300'>歌曲</div>
            <div className='mt-4 grid grid-cols-3 grid-rows-3 gap-5 gap-y-6 overflow-hidden pb-12'>
              {searchResult.result.song.songs.map(track => (
                <Track key={track.id} track={track} onPlay={handlePlayTracks} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
