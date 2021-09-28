<script setup lang="ts">
import dayjs from 'dayjs'
import { resizeImage, formatDuration } from '@renderer/utils/common'
import {
  search,
  SearchApiNames,
  SearchTypes,
  multiMatchSearch,
} from '@renderer/api/search'

const { t, locale } = useI18n()
const store = useStore()
const router = useRouter()
const keywords = ref(store.uiStates.searchKeywords)

// 搜索结果
const {
  data: searchResult,
  isLoading,
  refetch,
} = useQuery(
  reactive([SearchApiNames.SEARCH, keywords]),
  () => {
    return search({ keywords: keywords.value, type: SearchTypes.ALL })
  },
  reactive({ enabled: !!keywords })
)
const tracks = computed(() => searchResult.value?.result?.song?.songs ?? [])
const artists = computed(
  () => searchResult.value?.result?.artist?.artists ?? []
)
const albums = computed(() => searchResult.value?.result?.album?.albums ?? [])
const playlists = computed(
  () => searchResult.value?.result?.playList?.playLists ?? []
)
const users = computed(() => searchResult.value?.result?.user?.users ?? [])

// 最佳匹配（仅在综合分类中使用）
const {
  data: multiMatchSearchResult,
  isLoading: isMultiMatchSearchLoading,
  refetch: refetchMultiMatchSearch,
} = useQuery(
  reactive([SearchApiNames.MULTI_MATCH_SEARCH, keywords]),
  () => {
    return multiMatchSearch({ keywords: keywords.value })
  },
  reactive({ enabled: !!keywords })
)
const topResult = computed(() => {
  const searchData = multiMatchSearchResult.value?.result
  if (!searchData) return null
  const type = searchData?.orders?.[0] ?? 'artist'

  return { item: searchData[type][0], type }
})

// 检测关键词变化
debouncedWatch(
  computed(() => store.uiStates.searchKeywords),
  () => {
    const newKeywords = store.uiStates.searchKeywords
    if (newKeywords.trim() === keywords.value.trim()) {
      // 输入空格时不重新搜索
      return
    }
    keywords.value = newKeywords
    console.log(
      `[debug] fetch search result (keywords: ${store.uiStates.searchKeywords})`
    )

    // 重新搜索
    refetch.value()
    refetchMultiMatchSearch.value()
  },
  { debounce: 500 }
)
</script>

<template>
  <div class="mb-3 mt-6 text-xl font-semibold">Songs</div>
  <div>
    <div
      v-for="track in tracks"
      class="group btn-hover-animation flex w-full rounded-xl p-2 pr-4 after:scale-[.98] after:rounded-xl after:bg-gray-100"
    >
      <img
        :src="resizeImage(track.al.picUrl, 'xs')"
        class="mr-4 box-content h-12 w-12 rounded-md border border-black border-opacity-[.03]"
      />
      <div class="flex flex-col justify-center">
        <div class="line-clamp-1 break-all text-lg font-semibold">{{
          track.name
        }}</div>
        <div class="text-sm text-gray-500">
          Song<span class="mx-1.5">•</span>
          <ArtistInline :artists="track.ar" class="inline-flex" />
        </div>
      </div>
    </div>
  </div>

  <div class="mb-3 mt-6 text-xl font-semibold">Albums</div>
  <div>
    <div
      v-for="album in albums"
      @click="router.push({ name: 'album', params: { id: album.id } })"
      class="group btn-hover-animation flex w-full rounded-xl p-2 pr-4 after:scale-[.98] after:rounded-xl after:bg-gray-100"
    >
      <img
        :src="resizeImage(album.picUrl, 'xs')"
        class="mr-4 box-content h-12 w-12 rounded-md border border-black border-opacity-[.03]"
      />
      <div class="flex flex-col justify-center">
        <div class="line-clamp-1 break-all text-lg font-semibold">{{
          album.name
        }}</div>
        <div class="text-sm text-gray-500">
          Album<span class="mx-1.5">•</span>{{ album.artist.name
          }}<span class="mx-1.5">•</span>{{ dayjs(album.publishTime).year() }}
        </div>
      </div>
    </div>
  </div>

  <div class="mb-3 mt-6 text-xl font-semibold">Artists</div>
  <div>
    <div
      v-for="artist in artists"
      @click="router.push({ name: 'artist', params: { id: artist.id } })"
      class="group btn-hover-animation flex w-full rounded-xl p-2 pr-4 after:scale-[.98] after:rounded-xl after:bg-gray-100"
    >
      <img
        :src="resizeImage(artist.img1v1Url, 'xs')"
        class="mr-4 box-content h-12 w-12 rounded-full border border-black border-opacity-[.03]"
      />
      <div class="flex flex-col justify-center">
        <div class="line-clamp-1 break-all text-lg font-semibold">{{
          artist.name
        }}</div>
        <div class="text-sm text-gray-500"> Artist </div>
      </div>
    </div>
  </div>

  <div class="mb-3 mt-6 text-xl font-semibold">Playlists</div>
  <div>
    <div
      v-for="playlist in playlists"
      @click="router.push({ name: 'playlist', params: { id: playlist.id } })"
      class="group btn-hover-animation flex w-full rounded-xl p-2 pr-4 after:scale-[.98] after:rounded-xl after:bg-gray-100"
    >
      <img
        :src="resizeImage(playlist.coverImgUrl || playlist.picUrl || '', 'xs')"
        class="mr-4 box-content h-12 w-12 rounded-md border border-black border-opacity-[.03]"
      />
      <div class="flex flex-col justify-center">
        <div class="line-clamp-1 break-all text-lg font-semibold">{{
          playlist.name
        }}</div>
        <div class="text-sm text-gray-500">
          Playlist<span class="mx-1.5">•</span>{{ playlist.creator.nickname
          }}<span class="mx-1.5">•</span>{{ playlist.trackCount }} Songs
        </div>
      </div>
    </div>
  </div>
</template>
