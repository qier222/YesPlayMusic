import useAlbum from '@/web/api/hooks/useAlbum'
import useTracks from '@/web/api/hooks/useTracks'
import { useParams } from 'react-router-dom'
import PageTransition from '@/web/components/New/PageTransition'
import TrackList from '@/web/components/New/TrackList'
import player from '@/web/states/player'
import toast from 'react-hot-toast'
import { useCallback } from 'react'
import MoreByArtist from './MoreByArtist'
import Header from './Header'

const Album = () => {
  const params = useParams()
  const { data: album, isLoading } = useAlbum({
    id: Number(params.id),
  })

  const { data: tracks } = useTracks({
    ids: album?.songs?.map(track => track.id) ?? [],
  })

  const onPlay = useCallback(
    async (trackID: number | null = null) => {
      if (!album?.album?.id) {
        toast('无法播放专辑，该专辑不存在')
        return
      }
      player.playAlbum(album.album.id, trackID)
    },
    [album?.album?.id]
  )

  return (
    <PageTransition>
      <Header />
      <TrackList
        tracks={
          tracks?.songs?.length
            ? tracks?.songs
            : album?.album?.songs?.length
            ? album?.album.songs
            : album?.songs?.length
            ? album.songs
            : undefined
        }
        className='z-10 mx-2.5 mt-3 lg:mx-0 lg:mt-10'
        onPlay={onPlay}
        isLoading={isLoading}
      />
      <MoreByArtist album={album?.album} />

      {/* Page padding */}
      <div className='h-16'></div>
    </PageTransition>
  )
}

export default Album
