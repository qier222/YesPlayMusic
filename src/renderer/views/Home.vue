<script setup lang="ts">
import { PlaylistApiNames } from '@renderer/api/playlist'
import { fetchRecommendedPlaylists } from '@renderer/api/playlist'

const router = useRouter()

const { data: recommendedPlaylists, isLoading: isLoadingRecommendedPlaylists } =
  useQuery(PlaylistApiNames.FETCH_RECOMMENDED_PLAYLISTS, () => {
    return fetchRecommendedPlaylists({})
  })
</script>

<template>
  <div>
    <CoverRow
      title="Good Morning"
      :playlists="recommendedPlaylists?.result.slice(0, 10) ?? []"
      :isSkeleton="isLoadingRecommendedPlaylists"
    />
    <div class="mt-10 mb-4 text-[28px] font-bold text-black dark:text-white"
      >For You</div
    >
    <div class="grid grid-cols-2 gap-6">
      <DailyTracksCard />
      <FMCard />
    </div>
  </div>
</template>
