import useUserListenedRecords from '@/web/api/hooks/useUserListenedRecords'
import useArtists from '@/web/api/hooks/useArtists'
import { useMemo } from 'react'
import ArtistRow from '@/web/components/New/ArtistRow'

const RecentlyListened = () => {
  const { data: listenedRecords } = useUserListenedRecords({ type: 'week' })
  const recentListenedArtistsIDs = useMemo(() => {
    const artists: {
      id: number
      playCount: number
    }[] = []
    listenedRecords?.weekData?.forEach(record => {
      const artist = record.song.ar[0]
      const index = artists.findIndex(a => a.id === artist.id)
      if (index === -1) {
        artists.push({
          id: artist.id,
          playCount: record.playCount,
        })
      } else {
        artists[index].playCount += record.playCount
      }
    })

    return artists
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)
      .map(artist => artist.id)
  }, [listenedRecords])
  const { data: recentListenedArtists } = useArtists(recentListenedArtistsIDs)
  const artist = useMemo(
    () => recentListenedArtists?.map(a => a.artist),
    [recentListenedArtists]
  )

  return (
    <ArtistRow artists={artist} placeholderRow={1} title='RECENTLY LISTENED' />
  )
}

export default RecentlyListened
