import { css, cx } from '@emotion/css'
import useUserArtists from '@/web/api/hooks/useUserArtists'
import Tabs from '@/web/components/Tabs'
import { useMemo, useRef } from 'react'
import CoverRow from '@/web/components/CoverRow'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import useUserAlbums from '@/web/api/hooks/useUserAlbums'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import ArtistRow from '@/web/components/ArtistRow'
import { playerWidth, topbarHeight } from '@/web/utils/const'
import topbarBackground from '@/web/assets/images/topbar-background.png'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import { AnimatePresence, motion } from 'framer-motion'
import { scrollToBottom } from '@/web/utils/common'
import { throttle } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import VideoRow from '@/web/components/VideoRow'
import useUserVideos from '@/web/api/hooks/useUserVideos'
import persistedUiStates from '@/web/states/persistedUiStates'
import settings from '@/web/states/settings'
import useUser from '@/web/api/hooks/useUser'

const collections = ['playlists', 'albums', 'artists', 'videos'] as const
type Collection = typeof collections[number]

const Albums = () => {
  const { data: albums } = useUserAlbums()

  return <CoverRow albums={albums?.data} itemTitle='name' itemSubtitle='artist' />
}

const Playlists = () => {
  const { data: playlists } = useUserPlaylists()
  const user = useUser()
  const myPlaylists = useMemo(
    () => playlists?.playlist?.slice(1).filter(p => p.userId === user?.data?.account?.id),
    [playlists, user]
  )
  const otherPlaylists = useMemo(
    () => playlists?.playlist?.slice(1).filter(p => p.userId !== user?.data?.account?.id),
    [playlists, user]
  )
  return (
    <div>
      {/* My playlists */}
      {myPlaylists && (
        <>
          <div className='mb-4 mt-2 text-14 font-medium uppercase text-neutral-400'>
            Created BY ME
          </div>
          <CoverRow playlists={myPlaylists} />
        </>
      )}
      {/* Other playlists */}
      {otherPlaylists && (
        <>
          <div className='mb-4 mt-8 text-14 font-medium uppercase text-neutral-400'>
            Created BY OTHERS
          </div>
          <CoverRow playlists={otherPlaylists} />
        </>
      )}
    </div>
  )
}

const Artists = () => {
  const { data: artists } = useUserArtists()
  return <ArtistRow artists={artists?.data || []} />
}

const Videos = () => {
  const { data: videos } = useUserVideos()
  return <VideoRow videos={videos?.data || []} />
}

const CollectionTabs = ({ showBg }: { showBg: boolean }) => {
  const { t } = useTranslation()
  const { displayPlaylistsFromNeteaseMusic } = useSnapshot(settings)

  const tabs: { id: Collection; name: string }[] = [
    {
      id: 'albums',
      name: t`common.album_other`,
    },
    {
      id: 'playlists',
      name: t`common.playlist_other`,
    },
    {
      id: 'artists',
      name: t`common.artist_other`,
    },
    {
      id: 'videos',
      name: t`common.video_other`,
    },
  ]

  const { librarySelectedTab: selectedTab } = useSnapshot(persistedUiStates)
  const { minimizePlayer } = useSnapshot(persistedUiStates)
  const setSelectedTab = (id: Collection) => {
    persistedUiStates.librarySelectedTab = id
  }

  return (
    <div className='relative'>
      {/* Topbar background */}
      <AnimatePresence>
        {showBg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cx(
              'pointer-events-none absolute right-0 left-0 z-10',
              css`
                height: 230px;
                background-repeat: repeat;
              `
            )}
            style={{
              top: '-132px',
              backgroundImage: `url(${topbarBackground})`,
            }}
          ></motion.div>
        )}
      </AnimatePresence>

      <Tabs
        tabs={tabs.filter(tab => {
          if (!displayPlaylistsFromNeteaseMusic && tab.id === 'playlists') {
            return false
          }
          return true
        })}
        value={selectedTab}
        onChange={(id: Collection) => {
          setSelectedTab(id)
          scrollToBottom(true)
        }}
        className={cx('sticky z-10 -mb-10 px-2.5 lg:px-0')}
        style={{
          top: `${topbarHeight}px`,
        }}
      />
    </div>
  )
}

const Collections = () => {
  const { librarySelectedTab: selectedTab } = useSnapshot(persistedUiStates)

  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen: isScrollReachBottom } = useIntersectionObserver(observePoint)

  const onScroll = throttle(() => {
    if (isScrollReachBottom) return
    scrollToBottom(true)
  }, 500)

  return (
    <motion.div layout>
      <CollectionTabs showBg={isScrollReachBottom} />
      <div
        className={cx('no-scrollbar overflow-y-auto px-2.5 pt-16 pb-16 lg:px-0')}
        onScroll={onScroll}
        style={{
          height: `calc(100vh - ${topbarHeight}px)`,
        }}
      >
        {selectedTab === 'albums' && <Albums />}
        {selectedTab === 'playlists' && <Playlists />}
        {selectedTab === 'artists' && <Artists />}
        {selectedTab === 'videos' && <Videos />}
      </div>
      <div ref={observePoint}></div>
    </motion.div>
  )
}

export default Collections
