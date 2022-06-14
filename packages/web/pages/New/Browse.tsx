import Tabs from '@/web/components/New/Tabs'
import {
  fetchDailyRecommendPlaylists,
  fetchRecommendedPlaylists,
} from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useState } from 'react'
import { useQuery } from 'react-query'
import CoverRowVirtual from '@/web/components/New/CoverRowVirtual'
import PageTransition from '@/web/components/New/PageTransition'
import { playerWidth, topbarHeight } from '@/web/utils/const'
import { cx, css } from '@emotion/css'
import CoverRow from '@/web/components/New/CoverRow'
import topbarBackground from '@/web/assets/images/topbar-background.png'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
}

const Recommend = () => {
  const { data: dailyRecommendPlaylists } = useQuery(
    PlaylistApiNames.FetchDailyRecommendPlaylists,
    () => fetchDailyRecommendPlaylists(),
    reactQueryOptions
  )
  const { data: recommendedPlaylists } = useQuery(
    [PlaylistApiNames.FetchRecommendedPlaylists, { limit: 200 }],
    () => fetchRecommendedPlaylists({ limit: 200 }),
    reactQueryOptions
  )
  const playlists = [
    ...(dailyRecommendPlaylists?.recommend || []),
    ...(recommendedPlaylists?.result || []),
  ]

  // return (
  //   <CoverRowVirtual
  //     playlists={playlists}
  //     containerStyle={{
  //       height: `${document.body.clientHeight - topbarHeight - 44}px`,
  //     }}
  //   />
  // )

  return <CoverRow playlists={playlists} />
}

const All = () => {
  return <div></div>
}

const categories = [
  { id: 'recommend', name: 'Recommend', component: <Recommend /> },
  { id: 'all', name: 'All', component: <All /> },
  { id: 'featured', name: 'Featured', component: <Recommend /> },
  { id: 'official', name: 'Official', component: <Recommend /> },
  { id: 'charts', name: 'Charts', component: <Recommend /> },
]
const categoriesKeys = categories.map(c => c.id)
type Key = typeof categoriesKeys[number]

const Browse = () => {
  const [active, setActive] = useState<Key>('recommend')

  return (
    <PageTransition>
      {/* Topbar background */}
      <div
        className={cx(
          'pointer-events-none fixed top-0 left-0 z-10 hidden lg:block',
          css`
            height: 230px;
            right: ${playerWidth + 32}px;
            background-image: url(${topbarBackground});
          `
        )}
      ></div>

      <Tabs
        tabs={categories}
        value={active}
        onChange={category => setActive(category)}
        className='sticky top-0 z-10 px-2.5 lg:px-0'
      />

      <div className='relative mx-2.5 mt-5 lg:mx-0'>
        {categories.find(c => c.id === active)?.component}
      </div>
    </PageTransition>
  )
}

export default Browse
