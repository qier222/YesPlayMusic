<script setup lang="ts">
import type { PropType } from 'vue'
import { formatDate } from '@renderer/utils/common'
import { resizeImage } from '@renderer/utils/common'

const router = useRouter()
const props = defineProps({
  playlists: {
    type: Array as PropType<Playlist[]> | undefined,
  },
  albums: {
    type: Array as PropType<Album[]> | undefined,
  },
  artists: {
    type: Array as PropType<Artist[]> | undefined,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String as PropType<
      'copywriter' | 'creator' | 'type+releaseYear' | 'artist'
    >,
    default: 'copywriter',
  },
  seeMoreLink: {
    type: String,
    default: '',
  },
  isSkeleton: {
    type: Boolean,
    default: false,
  },
  gridClass: {
    type: String,
  },
})

type Item = Playlist | Album | Artist

const getImageUrl = (item: Item) => {
  let cover: string | undefined = ''
  if ('coverImgUrl' in item) cover = item.coverImgUrl
  if ('picUrl' in item) cover = item.picUrl
  if ('img1v1Url' in item) cover = item.img1v1Url
  return resizeImage(cover || '', 'md')
}

const getSubtitleText = (item: Item, subtitle: string) => {
  const nickname = 'creator' in item ? item.creator.nickname : 'someone'
  const releaseYear =
    'publishTime' in item
      ? formatDate(item.publishTime, 'en', 'YYYY')
      : 'unknown'
  const types = {
    playlist: 'playlist',
    album: 'Album',
    专辑: 'Album',
    Single: 'Single',
    'EP/Single': 'EP',
    EP: 'EP',
    unknown: 'unknown',
  }
  const type = 'type' in item ? item.type || 'unknown' : 'unknown'
  const artist = 'artist' in item ? item.artist.name : 'unknown'

  const table = {
    creator: `by ${nickname}`,
    'type+releaseYear': `${types[type]} · ${releaseYear}`,
    artist: artist,
  }
  return table[subtitle] ?? item[subtitle]
}

const mainContainerRef = ref<HTMLElement | null>(
  document.getElementById('mainContainer')
)
const goTo = (item: Item) => {
  const isAlbum = !!props.albums
  const isPlaylist = !!props.playlists
  router.push({
    name: isAlbum ? 'album' : isPlaylist ? 'playlist' : 'artist',
    params: { id: item.id },
  })
  if (isAlbum) {
    mainContainerRef.value?.scrollTo({
      top: 0,
      left: 0,
    })
  }
}

const skeletonItems: Array<Item> = new Array(10).fill({})
const renderItems = computed(() => {
  if (props.isSkeleton) {
    return skeletonItems
  }
  return props.albums ?? props.playlists ?? props.artists ?? []
})
</script>

<template>
  <!-- Header -->
  <div class="flex items-baseline justify-between">
    <div
      v-if="title"
      class="my-4 text-[28px] font-bold text-black dark:text-white"
      >{{ title }}</div
    >
    <div
      v-if="seeMoreLink"
      class="text-13px font-semibold text-gray-600 hover:underline"
      @click="router.push(seeMoreLink as string)"
      >查看全部</div
    >
  </div>

  <!-- Items -->
  <div
    class="grid gap-x-[24px] gap-y-7"
    :class="{
      'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': !gridClass,
      [`${gridClass}`]: gridClass,
    }"
  >
    <div v-for="(item, index) in renderItems">
      <!-- Cover -->
      <Cover
        v-if="!isSkeleton"
        :imageUrl="getImageUrl(item)"
        :isRounded="!!artists"
        @click="goTo(item)"
      />
      <Skeleton v-else class="aspect-square w-full rounded-xl" />

      <!-- Info -->
      <div class="mt-2">
        <div
          @click="goTo(item)"
          class="font-semibold"
          :class="{
            'justify-center': !!artists,
          }"
        >
          <!-- Name -->
          <span
            v-if="!isSkeleton"
            class="line-clamp-2 leading-tight decoration-gray-600 decoration-2 hover:underline"
          >
            <!-- Playlist private icon -->
            <SvgIcon
              v-if="(item as Playlist).privacy"
              name="lock"
              class="mr-1 mb-1 inline-block h-3 w-3 text-gray-300"
            />{{ item.name }}</span
          >
          <div class="flex w-full flex-col" v-else>
            <Skeleton class="w-full leading-tight">PLACEHOLDER</Skeleton>
            <Skeleton class="w-1/3 translate-y-px leading-tight"
              >PLACEHOLDER</Skeleton
            >
          </div>
        </div>

        <!-- Subtitle -->
        <div v-if="!isSkeleton" class="flex text-[12px] text-gray-500">
          <span>{{ getSubtitleText(item, subtitle) }}</span>
        </div>
        <Skeleton v-else class="w-3/5 translate-y-[2px] text-[12px]"
          >PLACEHOLDER</Skeleton
        >
      </div>
    </div>
  </div>
</template>
