import TrackListHeader from '@/web/components/New/TrackListHeader'
import useAlbum from '@/web/api/hooks/useAlbum'
import useTracks from '@/web/api/hooks/useTracks'
import { useParams } from 'react-router-dom'
import PageTransition from '@/web/components/New/PageTransition'
import TrackList from '@/web/components/New/TrackList'
import { player } from '@/web/store'
import toast from 'react-hot-toast'
import { useSnapshot } from 'valtio'

const Album = () => {
  const params = useParams()
  const { data: album, isLoading } = useAlbum({
    id: Number(params.id) || 0,
  })

  const { data: tracks } = useTracks({
    ids: album?.songs?.map(track => track.id) ?? [],
  })

  const playerSnapshot = useSnapshot(player)

  const onPlay = async (trackID: number | null = null) => {
    if (!album?.album.id) {
      toast('无法播放专辑，该专辑不存在')
      return
    }
    if (
      playerSnapshot.trackListSource?.type === 'album' &&
      playerSnapshot.trackListSource?.id === album.album.id
    ) {
      await player.playTrack(trackID ?? album.songs[0].id)
      return
    }
    await player.playAlbum(album.album.id, trackID)
  }

  return (
    <PageTransition>
      <TrackListHeader album={album?.album} onPlay={() => onPlay()} />
      <TrackList
        tracks={tracks?.songs}
        className='z-10 mt-20'
        onPlay={onPlay}
      />
    </PageTransition>
  )
}

export default Album
