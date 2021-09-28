<script setup lang="ts">
import { resizeImage, formatDate } from '@renderer/utils/common'
import usePlaylist from '@renderer/hooks/usePlaylist'
import useTracksInfinite from '@renderer/hooks/useTracksInfinite'
import usePlayer from '@renderer/hooks/usePlayer'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// Validate playlist id
const playlistID = computed(() => route.params.id as string)
if (!playlistID.value || isNaN(Number(playlistID.value))) {
  router.replace('/404')
}

// Fetch playlist data
const { data: playlistRaw, isLoading: isLoadingPlaylist } = usePlaylist(
  reactive({
    id: playlistID,
    s: 0,
  })
)
const playlist = computed(() => {
  return playlistRaw?.value?.playlist
})
const coverUrl = computed(() => {
  return resizeImage(playlist?.value?.coverImgUrl || '', 'md')
})
const trackIDs = computed(() => playlist.value?.trackIds?.map(t => t.id) || [])

// Infinite query tracks
const {
  data: infiniteTracks,
  isFetching: isFetchingTracks,
  isLoading: isLoadingTracks,
  hasNextPage,
  fetchNextPage,
} = useTracksInfinite(
  reactive({
    ids: trackIDs,
  })
)

// Load more tracks when scrolled to bottom
const mainContainerRef = ref<HTMLElement | null>(
  document.getElementById('mainContainer')
)
const mainContainerScroll = useScroll(mainContainerRef)

watch(
  () => mainContainerScroll.arrivedState.bottom,
  isScrolledToBottom => {
    if (!isScrolledToBottom && isFetchingTracks.value && !hasNextPage?.value) {
      return
    }
    console.debug('scrolled to bottom, load more tracks!')
    fetchNextPage.value()
  }
)

// Show tracks from usePlaylist() until useTracksInfinite() is loaded
const isShowTracksFromPlaylistQuery = ref(true)
watch(
  () => isLoadingTracks.value,
  isLoadingTracks => {
    if (isLoadingTracks) return
    isShowTracksFromPlaylistQuery.value = false
  }
)
watch(
  // Reset isShowTracksFromPlaylistQuery when playlist id is changed
  () => playlistID.value,
  () => {
    isShowTracksFromPlaylistQuery.value = true
  }
)

// Handle play playlist
const player = usePlayer()
const play = () => {
  player?.replacePlaylist(trackIDs.value, {
    type: 'playlist',
    id: playlistID,
  })
}
</script>

<template>
  <div class="mt-10">
    <!-- Header background -->
    <div class="absolute top-0 left-0 z-0 h-[24rem] w-full overflow-hidden">
      <img :src="coverUrl" class="absolute top-0 w-full blur-[100px]" />
      <img :src="coverUrl" class="absolute top-0 w-full blur-[100px]" />
      <div
        class="absolute top-0 h-full w-full bg-gradient-to-b from-[#ffffffd6] to-white/100"
      ></div>
    </div>

    <div class="grid grid-cols-[16rem_auto] items-center gap-9">
      <!-- Cover -->
      <div class="relative z-0 aspect-square self-start">
        <div
          v-if="!isLoadingPlaylist"
          class="absolute top-3.5 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-2xl bg-cover opacity-40 blur-lg filter"
          :style="{
            backgroundImage: `url(&quot;${coverUrl}&quot;)`,
          }"
        ></div>

        <img
          v-if="!isLoadingPlaylist"
          :src="coverUrl"
          class="rounded-2xl border border-black border-opacity-5"
        />
        <Skeleton v-else class="h-full w-full rounded-2xl" />
      </div>

      <!-- Playlist info -->
      <div class="z-10">
        <!-- Playlist name -->
        <div v-if="!isLoadingPlaylist" class="text-4xl font-bold">{{
          playlist?.name
        }}</div>
        <Skeleton v-else class="w-3/4 text-4xl">PLACEHOLDER</Skeleton>

        <!-- Playlist creator -->
        <div
          v-if="!isLoadingPlaylist"
          class="mt-5 text-lg font-medium text-gray-800"
        >
          Playlist by <span>{{ playlist?.creator.nickname }}</span>
        </div>
        <Skeleton v-else class="mt-5 w-64 text-lg">PLACEHOLDER</Skeleton>

        <!-- Playlist last update time & track count -->
        <div v-if="!isLoadingPlaylist" class="text-sm font-thin text-gray-500">
          Updated at
          {{ formatDate(playlist?.updateTime || 0, locale) }} ·
          {{ playlist?.trackCount }} Songs
        </div>
        <Skeleton v-else class="w-72 translate-y-px text-sm"
          >PLACEHOLDER</Skeleton
        >

        <!-- Playlist description -->
        <div
          v-if="!isLoadingPlaylist"
          class="line-clamp-2 mt-5 min-h-[2.5rem] text-sm text-gray-500"
        >
          {{ playlist?.description }}
        </div>
        <Skeleton v-else class="mt-5 min-h-[2.5rem] w-1/2 text-sm"
          >PLACEHOLDER</Skeleton
        >

        <!-- Buttons -->
        <div class="mt-5 flex gap-4">
          <Button @click="play" :isSkelton="isLoadingPlaylist">
            <SvgIcon name="play" class="mr-2 h-4 w-4" />
            PLAY
          </Button>

          <Button :isSkelton="isLoadingPlaylist" shape="square" color="gray">
            <SvgIcon name="heart" class="h-4 w-4" />
          </Button>
          <Button
            :isSkelton="isLoadingPlaylist"
            shape="square"
            color="gray"
            iconColor="gray"
          >
            <SvgIcon name="more" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Tracks table header -->
    <div
      class="ml-2 mr-4 mt-10 mb-2 grid grid-cols-12 border-b border-gray-100 py-2.5 text-sm text-gray-400"
    >
      <div class="col-span-6 grid grid-cols-[4.2rem_auto]">
        <div></div>
        <div>TITLE</div>
      </div>
      <div class="col-span-4">ALBUM</div>
      <div class="col-span-2 justify-self-end">TIME</div>
    </div>

    <!-- Initial Tracks -->
    <TrackList
      v-if="isShowTracksFromPlaylistQuery"
      :tracks="playlist?.tracks || []"
      layout="list"
      :isLoading="isLoadingPlaylist"
    />
    <!-- Infinite tracks -->
    <TrackList
      v-for="page in infiniteTracks?.pages"
      :tracks="page?.songs || []"
      layout="list"
    />
  </div>
</template>
