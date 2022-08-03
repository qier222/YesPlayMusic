import { useParams } from 'react-router-dom'
import PageTransition from '@/web/components/New/PageTransition'
import TrackList from '@/web/components/New/TrackList'
import player from '@/web/states/player'
import usePlaylist from '@/web/api/hooks/usePlaylist'
import Header from './Header'

const Playlist = () => {
  const params = useParams()
  const { data: playlist } = usePlaylist({
    id: Number(params.id),
  })

  const onPlay = async (trackID: number | null = null) => {
    await player.playPlaylist(playlist?.playlist?.id, trackID)
  }

  return (
    <PageTransition>
      <Header />
      <TrackList
        tracks={playlist?.playlist?.tracks ?? []}
        onPlay={onPlay}
        className='z-10 mt-10'
      />
    </PageTransition>
  )
}

export default Playlist
