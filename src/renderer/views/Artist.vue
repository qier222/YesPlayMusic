<script setup lang="ts">
import useArtist from '@renderer/hooks/useArtist'
import useArtistAlbums from '@renderer/hooks/useArtistAlbums'
import { resizeImage } from '@renderer/utils/common'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// Validate artist id
const artistID = computed(() => route.params.id as string)
if (!artistID.value || isNaN(Number(artistID.value))) {
  router.replace('/404')
}

// Fetch artist data
const { data: ArtistRaw, isLoading } = useArtist(
  reactive({
    id: artistID,
  })
)
const artist = computed(() => {
  return ArtistRaw?.value?.artist
})
const cover = computed(() => {
  if (!artist.value) return ''
  return resizeImage(artist.value.img1v1Url, 'sm')
})
const topTracks = computed(() => {
  return ArtistRaw?.value?.hotSongs || []
})

// Fetch artist's albums
const { data: albums, isLoading: isLoadingAlbums } = useArtistAlbums(
  reactive({
    id: artistID,
  })
)
</script>

<template>
  <div class="mt-10">
    <!-- Header background -->
    <div class="absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden">
      <img :src="cover" class="absolute top-0 w-full blur-[100px]" />
      <img :src="cover" class="absolute top-0 w-full blur-[100px]" />
      <div
        class="absolute top-0 h-full w-full bg-gradient-to-b from-[#ffffffd6] to-white/100"
      ></div>
    </div>

    <!-- Artist info -->
    <div class="relative flex items-center">
      <img :src="cover" class="mr-12 ml-4 h-60 w-60 rounded-full shadow-lg" />
      <div>
        <!-- Name -->
        <div class="text-6xl font-bold">{{ artist?.name }}</div>

        <!-- Artist -->
        <div class="mt-5 text-lg font-medium text-gray-800"> Artist </div>
        <div class="text-sm font-thin text-gray-500">
          {{ artist?.musicSize }} Tracks · {{ artist?.albumSize }} Albums ·
          {{ artist?.mvSize }} Music Videos
        </div>

        <!-- Description -->
        <div
          class="line-clamp-2 mt-5 min-h-[2.5rem] max-w-xl text-sm text-gray-500"
        >
          {{ artist?.briefDesc }}
        </div>

        <!-- Buttons -->
        <div class="mt-5 flex gap-4">
          <Button :isSkelton="isLoading">
            <SvgIcon name="play" class="mr-2 h-4 w-4" />
            PLAY
          </Button>

          <Button :isSkelton="isLoading" color="gray" iconColor="gray">
            Follow
          </Button>
          <Button
            :isSkelton="isLoading"
            shape="square"
            color="gray"
            iconColor="gray"
          >
            <SvgIcon name="more" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Top tracks -->
    <div class="mt-16 mb-4 text-xl font-semibold">Top Tracks</div>
    <TrackList
      :tracks="topTracks.slice(0, 12)"
      :col="4"
      :isLoading="isLoading"
    />

    <!-- Albums -->
    <div class="mt-10 mb-4 text-xl font-semibold">Albums</div>
    <CoverRow
      :albums="albums?.hotAlbums || []"
      :isSkeleton="isLoadingAlbums"
      subtitle="type+releaseYear"
    />
  </div>
</template>
