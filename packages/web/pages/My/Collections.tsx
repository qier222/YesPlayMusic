import { css, cx } from '@emotion/css'
import useUserArtists from '@/web/api/hooks/useUserArtists'
import Tabs from '@/web/components/Tabs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const Albums = () => {
  const { data: albums } = useUserAlbums()

  return (
    <CoverRow albums={albums?.data} itemTitle='name' itemSubtitle='artist' />
  )
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

const CollectionTabs = ({ showBg }: { showBg: boolean }) => {
  const { t } = useTranslation()

  const tabs = [
    {
      id: 'playlists',
      name: t`common.playlist_other`,
    },
    {
      id: 'albums',
      name: t`common.album_other`,
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

  const { librarySelectedTab: selectedTab } = useSnapshot(uiStates)
  const setSelectedTab = (
    id: 'playlists' | 'albums' | 'artists' | 'videos'
  ) => {
    uiStates.librarySelectedTab = id
  }

  return (
    <>
      {/* Topbar background */}
      <AnimatePresence>
        {showBg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cx(
              'pointer-events-none fixed top-0 left-10 z-10 hidden lg:block',
              css`
                height: 230px;
                right: ${playerWidth + 32}px;
                background-image: url(${topbarBackground});
              `
            )}
          ></motion.div>
        )}
      </AnimatePresence>

      <Tabs
        tabs={tabs}
        value={selectedTab}
        onChange={(id: string) => {
          setSelectedTab(id)
          scrollToBottom(true)
        }}
        className={cx(
          'sticky z-10 -mb-10 px-2.5 lg:px-0',
          css`
            top: ${topbarHeight}px;
          `
        )}
      />
    </>
  )
}

const Collections = () => {
  const { librarySelectedTab: selectedTab } = useSnapshot(uiStates)

  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen: isScrollReachBottom } =
    useIntersectionObserver(observePoint)

  const onScroll = throttle(() => {
    if (isScrollReachBottom) return
    scrollToBottom(true)
  }, 500)

  return (
    <div>
      <CollectionTabs showBg={isScrollReachBottom} />
      <div
        className={cx(
          'no-scrollbar overflow-y-auto px-2.5 pt-16 pb-16 lg:px-0',
          css`
            height: calc(100vh - ${topbarHeight}px);
          `
        )}
        onScroll={onScroll}
      >
        {selectedTab === 'albums' && <Albums />}
        {selectedTab === 'playlists' && <Playlists />}
        {selectedTab === 'artists' && <Artists />}
      </div>
      <div ref={observePoint}></div>
    </div>
  )
}

export default Collections
