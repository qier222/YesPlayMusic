<script setup lang="ts">
import { resizeImage, formatDuration, formatDate } from '@renderer/utils/common'
import useAlbum from '@renderer/hooks/useAlbum'
import dayjs from 'dayjs'
import useArtistAlbums from '@renderer/hooks/useArtistAlbums'
import usePlayer, { PlayerState } from '@renderer/hooks/usePlayer'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// Validate album id
const albumID = computed(() => route.params.id as string)
if (!albumID.value || isNaN(Number(albumID.value))) {
  router.replace('/404')
}

// Fetch album data
const { data: albumRaw, isLoading } = useAlbum(
  reactive({
    id: albumID,
  })
)
const album = computed(() => {
  return albumRaw?.value?.album
})
const tracks = computed(() => {
  return albumRaw?.value?.songs
})
const coverUrl = computed(() => {
  return resizeImage(album?.value?.picUrl || '', 'lg')
})
const albumDuration = computed(() => {
  const duration = tracks.value?.reduce((acc, cur) => acc + cur.dt, 0) || 0
  return formatDuration(duration, locale.value, 'hh[hr] mm[min]')
})

// Fetch artist's albums
const { data: otherAlbums, isLoading: isLoadingMoreAlbums } = useArtistAlbums(
  reactive({
    id: computed(() => album.value?.artist.id || 0),
  })
)
const filteredOtherAlbums = computed((): Album[] => {
  const allReleases = otherAlbums.value?.hotAlbums || []
  const albums = allReleases.filter(
    album => ['专辑', 'EP/Single', 'EP'].includes(album.type) && album.size > 1
  )
  const singles = allReleases.filter(album => album.type === 'Single')

  // 去除名字相同的专辑和当前页面显示的专辑
  const deDuplicatedAlbums: Album[] = []
  albums.forEach(album => {
    if (
      deDuplicatedAlbums.findIndex(a => a.name === album.name) === -1 &&
      String(album.id) !== albumID.value
    ) {
      deDuplicatedAlbums.push(album)
    }
  })

  return [...deDuplicatedAlbums, ...singles].slice(0, 5)
})

// Handle play album
const player = usePlayer()
const play = () => {
  player?.replacePlaylist(tracks.value?.map(s => s.id) || [], {
    type: 'album',
    id: albumID.value,
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

    <div class="grid grid-cols-[17rem_auto] items-center gap-10">
      <!-- Cover -->
      <div class="relative z-0 aspect-square self-start">
        <div
          v-if="!isLoading"
          class="absolute top-3.5 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-2xl bg-cover opacity-60 blur-lg filter"
          :style="{
            backgroundImage: `url(&quot;${coverUrl}&quot;)`,
          }"
        ></div>

        <img
          v-if="!isLoading"
          :src="coverUrl"
          class="rounded-2xl border border-black border-opacity-5"
        />
        <Skeleton v-else class="h-full w-full rounded-2xl" />
      </div>

      <!-- Album info -->
      <div class="z-10">
        <!-- Name -->
        <div v-if="!isLoading" class="text-6xl font-bold">{{
          album?.name
        }}</div>
        <Skeleton v-else class="w-3/4 text-7xl">PLACEHOLDER</Skeleton>

        <!-- Artist -->
        <div v-if="!isLoading" class="mt-5 text-lg font-medium text-gray-800">
          Album by
          <span class="font-semibold decoration-2 hover:underline">{{
            album?.artist.name
          }}</span>
        </div>
        <Skeleton v-else class="mt-5 w-64 text-lg">PLACEHOLDER</Skeleton>

        <!-- Last update time & track count -->
        <div v-if="!isLoading" class="text-sm font-thin text-gray-500">
          {{ dayjs(album?.publishTime || 0).year() }} · {{ album?.size }} Songs,
          {{ albumDuration }}
        </div>
        <Skeleton v-else class="w-72 translate-y-px text-sm"
          >PLACEHOLDER</Skeleton
        >

        <!-- Description -->
        <div
          v-if="!isLoading"
          class="line-clamp-3 mt-5 min-h-[3.75rem] max-w-xl text-sm text-gray-500"
        >
          {{ album?.description }}
        </div>
        <Skeleton v-else class="mt-5 min-h-[3.75rem] w-1/2 text-sm"
          >PLACEHOLDER</Skeleton
        >

        <!-- Buttons -->
        <div class="mt-5 flex gap-4">
          <Button @click="play" :isSkelton="isLoading">
            <SvgIcon name="play" class="mr-2 h-4 w-4" />
            PLAY
          </Button>

          <Button :isSkelton="isLoading" shape="square" color="gray">
            <SvgIcon name="heart" class="h-4 w-4" />
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

    <!-- Tracks table header -->
    <div
      class="mx-4 mt-10 mb-2 grid grid-cols-12 border-b border-gray-100 py-2.5 text-sm text-gray-400"
    >
      <div class="col-span-6 grid grid-cols-[2rem_auto]">
        <div>#</div>
        <div>TITLE</div>
      </div>
      <div class="col-span-4">ARTIST</div>
      <div class="col-span-2 justify-self-end">TIME</div>
    </div>

    <!-- Tracks -->
    <TrackList :tracks="tracks || []" layout="album" :isLoading="isLoading" />

    <!-- Release date and company -->
    <div class="mt-5 text-xs text-gray-400">
      <div> Released {{ formatDate(album?.publishTime || 0, locale) }} </div>
      <div v-if="album?.company" class="mt-[2px]">© {{ album?.company }} </div>
    </div>

    <!-- More by artist -->
    <div class="my-5 h-px w-full bg-gray-100"></div>
    <div class="pl-px text-[1.375rem] font-semibold text-gray-800"
      >More by
      <router-link
        :to="{ name: 'artist', params: { id: album?.artist.id } }"
        class="hover:underline"
        >{{ album?.artist.name }}</router-link
      ></div
    >
    <div class="mt-3">
      <CoverRow
        :albums="filteredOtherAlbums"
        :isSkeleton="isLoadingMoreAlbums"
        subtitle="type+releaseYear"
      />
    </div>
  </div>
</template>
