import TrackListHeader from '@/web/components/New/TrackListHeader'
import { NavLink, useParams } from 'react-router-dom'
import PageTransition from '@/web/components/New/PageTransition'
import TrackList from '@/web/components/New/TrackList'
import { player } from '@/web/store'
import toast from 'react-hot-toast'
import { useSnapshot } from 'valtio'
import { memo, useEffect, useMemo } from 'react'
import usePlaylist from '@/web/api/hooks/usePlaylist'
import useTracksInfinite from '@/web/api/hooks/useTracksInfinite'
import useScroll from '@/web/hooks/useScroll'
const Playlist = () => {
  const params = useParams()
  const { data: playlist, isLoading } = usePlaylist({
    id: Number(params.id),
  })

  const playerSnapshot = useSnapshot(player)
  const onPlay = async (trackID: number | null = null) => {
    if (!playlist?.playlist.id) {
      toast('无法播放歌单，该歌单不存在')
      return
    }

    if (
      playerSnapshot.trackListSource?.type === 'playlist' &&
      playerSnapshot.trackListSource?.id === playlist.playlist.id &&
      playlist?.playlist?.trackIds?.[0].id
    ) {
      await player.playTrack(trackID ?? playlist.playlist.trackIds[0].id)
      return
    }
    await player.playPlaylist(playlist.playlist.id, trackID)
  }

  return (
    <PageTransition>
      <TrackListHeader playlist={playlist?.playlist} onPlay={onPlay} />
      <TrackList
        tracks={playlist?.playlist?.tracks ?? []}
        onPlay={onPlay}
        className='z-10 mt-10'
      />
    </PageTransition>
  )
}

export default Playlist
