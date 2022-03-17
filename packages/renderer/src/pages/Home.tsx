import { PlaylistApiNames, fetchRecommendedPlaylists } from '@/api/playlist'
import CoverRow from '@/components/CoverRow'
import DailyTracksCard from '@/components/DailyTracksCard'
import FMCard from '@/components/FMCard'

export default function Home() {
  const {
    data: recommendedPlaylists,
    isLoading: isLoadingRecommendedPlaylists,
  } = useQuery(PlaylistApiNames.FETCH_RECOMMENDED_PLAYLISTS, () => {
    return fetchRecommendedPlaylists({})
  })

  return (
    <div>
      <CoverRow
        title='Good Morning'
        playlists={recommendedPlaylists?.result.slice(0, 10) ?? []}
        isSkeleton={isLoadingRecommendedPlaylists}
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
