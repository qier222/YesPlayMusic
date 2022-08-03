import {
  fetchRecommendedPlaylists,
  fetchDailyRecommendPlaylists,
} from '@/web/api/playlist'
import CoverRow from '@/web/components/CoverRow'
import DailyTracksCard from '@/web/components/DailyTracksCard'
import FMCard from '@/web/components/FMCard'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'

export default function Home() {
  const {
    data: dailyRecommendPlaylists,
    isLoading: isLoadingDailyRecommendPlaylists,
  } = useQuery(
    [PlaylistApiNames.FetchDailyRecommendPlaylists],
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
    [PlaylistApiNames.FetchRecommendedPlaylists],
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
  ].slice(0, 10)

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
