import { useParams } from 'react-router-dom'
import PageTransition from '@/web/components/PageTransition'
import TrackList from './TrackList'
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
      <div className='pb-10'>
        <TrackList
          tracks={playlist?.playlist?.tracks ?? []}
          onPlay={onPlay}
          className='z-10 mt-10'
        />
      </div>
    </PageTransition>
  )
}

export default Playlist
