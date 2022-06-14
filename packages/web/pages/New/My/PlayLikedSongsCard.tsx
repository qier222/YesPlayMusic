import useLyric from '@/web/api/hooks/useLyric'
import usePlaylist from '@/web/api/hooks/usePlaylist'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import { player } from '@/web/store'
import { sample, chunk, sampleSize } from 'lodash-es'
import { css, cx } from '@emotion/css'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Icon from '@/web/components/Icon'
import { lyricParser } from '@/web/utils/lyric'
import Image from '@/web/components/New/Image'
import { resizeImage } from '@/web/utils/common'
import { breakpoint as bp } from '@/web/utils/const'

const Lyrics = ({ tracksIDs }: { tracksIDs: number[] }) => {
  const [id, setId] = useState(0)

  useEffect(() => {
    if (id === 0) {
      setId(sample(tracksIDs) || 0)
    }
  }, [id, tracksIDs])

  const { data: lyric } = useLyric({ id })

  const lyricLines = useMemo(() => {
    if (!lyric?.lrc?.lyric) return []

    const parsedLyrics = lyricParser(lyric)

    const lines = parsedLyrics.lyric.map(line => line.content)

    return sample(chunk(lines, 4)) ?? []
  }, [lyric])

  return (
    <div
      className={cx(
        'line-clamp-4 text-18 font-medium text-white/20 lg:text-21',
        css`
          height: 86px;
          ${bp.lg} {
            height: auto;
          }
        `
      )}
    >
      {lyricLines.map((line, index) => (
        <div key={`${index}-${line}`}>{line}</div>
      ))}
    </div>
  )
}

const Covers = memo(({ tracks }: { tracks: Track[] }) => {
  return (
    <div className='mt-6 grid w-full flex-shrink-0 grid-cols-3 gap-2.5 lg:mt-0 lg:ml-8 lg:w-auto'>
      {tracks.map(track => (
        <Image
          src={resizeImage(track.al.picUrl || '', 'md')}
          className={cx(
            'aspect-square rounded-24',
            css`
              ${bp.lg} {
                height: 125px;
                width: 125px;
              }
            `
          )}
          key={track.id}
        />
      ))}
    </div>
  )
})
Covers.displayName = 'Covers'

const PlayLikedSongsCard = () => {
  const navigate = useNavigate()

  const { data: playlists } = useUserPlaylists()

  const { data: likedSongsPlaylist } = usePlaylist({
    id: playlists?.playlist?.[0].id ?? 0,
  })

  const handlePlay = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!likedSongsPlaylist?.playlist.id) {
        toast('无法播放歌单')
        return
      }
      player.playPlaylist(likedSongsPlaylist.playlist.id)
    },
    [likedSongsPlaylist?.playlist.id]
  )

  const [sampledTracks, setSampledTracks] = useState<Track[]>([])
  useEffect(() => {
    const tracks = likedSongsPlaylist?.playlist?.tracks
    if (!sampledTracks.length && tracks?.length) {
      setSampledTracks(sampleSize(tracks, 3))
    }
  }, [likedSongsPlaylist?.playlist?.tracks, sampledTracks])

  return (
    <div
      className={cx(
        'mx-2.5 flex flex-col justify-between rounded-24 p-8 dark:bg-white/10 lg:mx-0',
        css`
          height: 372px;
          ${bp.lg} {
            height: 322px;
          }
        `
      )}
    >
      {/* Lyrics and Covers */}
      <div className='flex flex-col justify-between lg:flex-row'>
        <Lyrics tracksIDs={sampledTracks.map(t => t.id)} />
        <Covers tracks={sampledTracks} />
      </div>

      {/* Buttons */}
      <div className='flex justify-between'>
        <button
          onClick={handlePlay}
          className='rounded-full bg-brand-700 py-5 px-6 text-16 font-medium text-white'
        >
          Play Now
        </button>
        <button
          onClick={() =>
            navigate(`/playlist/${likedSongsPlaylist?.playlist.id}`)
          }
          className={cx(
            'flex items-center justify-center rounded-full bg-white/10 text-night-400',
            css`
              padding: 15.5px;
            `
          )}
        >
          <Icon name='forward' className='h-7 w-7 ' />
        </button>
      </div>
    </div>
  )
}

export default PlayLikedSongsCard
