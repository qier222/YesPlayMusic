import { css, cx } from '@emotion/css'
import useUserArtists from '@/web/api/hooks/useUserArtists'
import Tabs from '@/web/components/New/Tabs'
import { useMemo, useState } from 'react'
import CoverRow from '@/web/components/New/CoverRow'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import useUserAlbums from '@/web/api/hooks/useUserAlbums'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import ArtistRow from '@/web/components/New/ArtistRow'

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

const Albums = () => {
  const { data: albums } = useUserAlbums()

  return <CoverRow albums={albums?.data} />
}

const Playlists = () => {
  const { data: playlists } = useUserPlaylists()
  const p = useMemo(() => playlists?.playlist?.slice(1), [playlists])
  return <CoverRow playlists={p} />
}

const Artists = () => {
  const { data: artists } = useUserArtists()
  return <ArtistRow artists={artists?.data || []} />
}

const Collections = () => {
  const { librarySelectedTab: selectedTab } = useSnapshot(uiStates)
  const setSelectedTab = (
    id: 'playlists' | 'albums' | 'artists' | 'videos'
  ) => {
    uiStates.librarySelectedTab = id
  }

  return (
    <div>
      <Tabs
        tabs={tabs}
        value={selectedTab}
        onChange={(id: string) => setSelectedTab(id)}
        className='px-2.5 lg:px-0'
      />
      <div className='mt-6 px-2.5 lg:px-0'>
        {selectedTab === 'albums' && <Albums />}
        {selectedTab === 'playlists' && <Playlists />}
        {selectedTab === 'artists' && <Artists />}
      </div>
    </div>
  )
}

export default Collections
