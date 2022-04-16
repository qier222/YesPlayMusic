import {
  fetchRecommendedPlaylists,
  fetchDailyRecommendPlaylists,
} from '@/renderer/api/playlist'
import CoverRow from '@/renderer/components/CoverRow'
import DailyTracksCard from '@/renderer/components/DailyTracksCard'
import FMCard from '@/renderer/components/FMCard'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'

export default function Home() {
  const {
    data: dailyRecommendPlaylists,
    isLoading: isLoadingDailyRecommendPlaylists,
  } = useQuery(
    PlaylistApiNames.FETCH_DAILY_RECOMMEND_PLAYLISTS,
    fetchDailyRecommendPlaylists,
    {
      retry: false,
      placeholderData: () =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.RecommendResource,
        }),
    }
  )

  const {
    data: recommendedPlaylists,
    isLoading: isLoadingRecommendedPlaylists,
  } = useQuery(
    PlaylistApiNames.FETCH_RECOMMENDED_PLAYLISTS,
    () => {
      return fetchRecommendedPlaylists({})
    },
    {
      placeholderData: () =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Personalized,
        }),
    }
  )

  const playlists = [
    ...(dailyRecommendPlaylists?.recommend?.slice(1).slice(0, 8) ?? []),
    ...(recommendedPlaylists?.result ?? []),
  ]
    .slice(0, 10)
    .reverse()

  return (
    <div>
      <CoverRow
        title='推荐歌单'
        playlists={playlists}
        isSkeleton={
          isLoadingRecommendedPlaylists || isLoadingDailyRecommendPlaylists
        }
      />

      <div className='mt-10 mb-4 text-[28px] font-bold text-black dark:text-white'>
        For You
      </div>
      <div className='grid grid-cols-2 gap-6'>
        <DailyTracksCard />
        <FMCard />
      </div>
    </div>
  )
}
