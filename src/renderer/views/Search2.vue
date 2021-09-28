<script setup lang="ts">
import { resizeImage, formatDuration } from '@renderer/utils/common'
import {
  search,
  SearchApiNames,
  SearchTypes,
  multiMatchSearch,
} from '@renderer/api/search'
import { average } from 'color.js'
import { colord } from 'colord'

const { t, locale } = useI18n()
const store = useStore()
const keywords = store.uiStates.searchKeywords

// 搜索结果
const { data: searchResult, isLoading } = useQuery(
  reactive([SearchApiNames.SEARCH, keywords]),
  () => {
    return search({ keywords, type: SearchTypes.ALL })
  },
  reactive({ enabled: !!keywords })
)
const tracks = computed(() => searchResult.value?.result.song.songs ?? [])
const artists = computed(() => searchResult.value?.result.artist.artists ?? [])
const albums = computed(() => searchResult.value?.result.album.albums ?? [])
const playlists = computed(
  () => searchResult.value?.result.playList.playLists ?? []
)
const users = computed(() => searchResult.value?.result.user.users ?? [])

// 最佳匹配（仅在综合分类中使用）
const { data: multiMatchSearchResult, isLoading: isMultiMatchSearchLoading } =
  useQuery(
    reactive([SearchApiNames.MULTI_MATCH_SEARCH, keywords]),
    () => {
      return multiMatchSearch({ keywords })
    },
    reactive({ enabled: !!keywords })
  )
const topResult = computed(() => {
  const searchData = multiMatchSearchResult.value?.result
  if (!searchData) return null
  const type = searchData?.orders?.[0] ?? 'artist'

  return { item: searchData[type][0], type }
})
</script>

<template>
  <div>
    <div class="mt-10 mb-4 text-4xl font-semibold"
      ><span class="text-gray-400">Search for</span> "{{
        store.uiStates.searchKeywords
      }}"</div
    >

    <div class="mt-10 mb-3 grid grid-cols-5 gap-16">
      <!-- Top result -->
      <div v-if="topResult" class="col-span-2 flex flex-col self-stretch">
        <div class="mb-3 text-2xl font-semibold">Top Result</div>
        <div class="flex h-[14rem] flex-col rounded-2xl bg-gray-50 p-5">
          <img
            :src="topResult.item?.img1v1Url || topResult.item?.picUrl"
            class="h-28 w-28 rounded-xl"
          />
          <div class="mt-3 text-2xl font-semibold">{{
            topResult.item?.name
          }}</div>
          <div class="mt-1 text-sm font-medium text-gray-500"
            >{{ topResult?.type.replace(/^\S/, s => s.toUpperCase()) }}
            {{ topResult?.type === 'album' ? 'by' : '' }}
            <router-link
              :to="{ name: 'artist', params: { id: topResult.item.id } }"
              class="cursor-default font-semibold hover:underline"
              >{{
                topResult.type === 'album' ? topResult.item?.artist.name : ''
              }}</router-link
            ></div
          >
        </div>
      </div>

      <!-- Tracks -->
      <div class="col-span-3">
        <div class="mb-3 text-2xl font-semibold">Tracks</div>
        <div class="grid">
          <div
            v-for="track in tracks.slice(0, 4)"
            class="btn-hover-animation flex items-center justify-between p-2 pr-4 after:bg-gray-100"
          >
            <div class="flex">
              <img
                :src="resizeImage(track.al.picUrl, 'xs')"
                class="mr-3 h-10 w-10 rounded"
              />
              <div>
                <div class="font-semibold">{{ track.name }}</div>
                <ArtistInline
                  :artists="track.ar"
                  class="text-xs text-gray-500"
                />
              </div>
            </div>
            <div>
              {{ formatDuration(track.dt, locale, 'hh:mm:ss') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 grid grid-cols-2 gap-16">
      <!-- Albums -->
      <div>
        <div class="mb-3 text-2xl font-semibold">Albums</div>
        <CoverRow :albums="albums" subtitle="artist" gridClass="grid-cols-3" />
      </div>

      <!-- Artists -->
      <div>
        <div class="mb-3 text-2xl font-semibold">Artists</div>
        <CoverRow :artists="artists" gridClass="grid-cols-3" />
      </div>
    </div>

    <!-- Playlists -->
    <div class="mt-10 mb-3 text-2xl font-semibold">Playlists</div>
    <CoverRow
      :playlists="playlists"
      subtitle="creator"
      gridClass="grid-cols-6"
    />
  </div>
</template>
