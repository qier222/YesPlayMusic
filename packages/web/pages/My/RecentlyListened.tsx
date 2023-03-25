import useUserListenedRecords from '@/web/api/hooks/useUserListenedRecords'
import useArtists from '@/web/api/hooks/useArtists'
import { useEffect, useMemo, useState } from 'react'
import ArtistRow from '@/web/components/ArtistRow'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'

const RecentlyListened = () => {
  const { t } = useTranslation()

  const { data: listenedRecords, isLoading } = useUserListenedRecords({ type: 'week' })
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
  const { data: recentListenedArtists, isLoading: isLoadingArtistsDetail } =
    useArtists(recentListenedArtistsIDs)
  const artists = useMemo(() => recentListenedArtists?.map(a => a.artist), [recentListenedArtists])

  const show = useMemo(() => {
    if (listenedRecords?.weekData?.length === 0) return false
    if (isLoading || isLoadingArtistsDetail) return true
    if (artists?.length) return true
    return false
  }, [isLoading, artists, listenedRecords, isLoadingArtistsDetail])

  return (
    <AnimatePresence>
      {show && (
        <motion.div layout exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <ArtistRow artists={artists} placeholderRow={1} title={t`my.recently-listened`} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RecentlyListened
