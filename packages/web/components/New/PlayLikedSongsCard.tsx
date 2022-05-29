import useLyric from '@/web/api/hooks/useLyric'
import usePlaylist from '@/web/api/hooks/usePlaylist'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import { player } from '@/web/store'
import { sample, chunk } from 'lodash-es'
import { css, cx } from '@emotion/css'
import { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const PlayLikedSongsCard = () => {
  const navigate = useNavigate()

  const { data: playlists } = useUserPlaylists()

  const { data: likedSongsPlaylist } = usePlaylist({
    id: playlists?.playlist?.[0].id ?? 0,
  })

  // Lyric
  const [trackID, setTrackID] = useState(0)

  useEffect(() => {
    if (trackID === 0) {
      setTrackID(
        sample(likedSongsPlaylist?.playlist.trackIds?.map(t => t.id) ?? []) ?? 0
      )
    }
  }, [likedSongsPlaylist?.playlist.trackIds, trackID])

  const { data: lyric } = useLyric({
    id: trackID,
  })

  const lyricLines = useMemo(() => {
    return (
      sample(
        chunk(
          lyric?.lrc.lyric
            ?.split('\n')
            ?.map(l => l.split(']').pop()?.trim())
            ?.filter(
              l =>
                l &&
                !l.includes('作词') &&
                !l.includes('作曲') &&
                !l.includes('纯音乐，请欣赏')
            ),
          4
        )
      ) ?? []
    )
  }, [lyric])

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

  return (
    <div
      className={cx(
        'flex flex-col justify-between rounded-24 p-8 dark:bg-night-600',
        css`
          height: 322px;
        `
      )}
    >
      <div className='text-21 font-medium text-white/20'>
        {lyricLines.map((line, index) => (
          <div key={`${index}-${line}`}>{line}</div>
        ))}
      </div>
      <div>
        <button
          onClick={handlePlay}
          className='rounded-full bg-brand-700 py-5 px-6 text-16 font-medium text-white'
        >
          Play Now
        </button>
      </div>
    </div>
  )
}

export default PlayLikedSongsCard
