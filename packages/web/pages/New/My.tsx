import { css, cx } from '@emotion/css'
import PlayLikedSongsCard from '@/web/components/New/PlayLikedSongsCard'
import PageTransition from '@/web/components/New/PageTransition'
import useUserArtists from '@/web/api/hooks/useUserArtists'
import ArtistRow from '@/web/components/New/ArtistRow'
import Tabs from '@/web/components/New/Tabs'
import { useState } from 'react'
import CoverRow from '@/web/components/New/CoverRow'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import useUserAlbums from '@/web/api/hooks/useUserAlbums'

const tabs = [
  {
    id: 'playlists',
    name: 'Playlists',
  },
  {
    id: 'albums',
    name: 'Albums',
  },
  {
    id: 'artists',
    name: 'Artists',
  },
  {
    id: 'videos',
    name: 'Videos',
  },
]

const My = () => {
  const { data: artists } = useUserArtists()
  const { data: playlists } = useUserPlaylists()
  const { data: albums } = useUserAlbums()
  const [selectedTab, setSelectedTab] = useState(tabs[0].id)

  return (
    <PageTransition>
      <div className='grid grid-cols-1 gap-10'>
        <PlayLikedSongsCard />
        <div>
          <ArtistRow artists={artists?.data} title='ARTISTS' />
        </div>

        <div>
          <Tabs
            tabs={tabs}
            value={selectedTab}
            onChange={(id: string) => setSelectedTab(id)}
          />
          <CoverRow albums={albums?.data} className='mt-6' />
        </div>
      </div>
    </PageTransition>
  )
}

export default My
