<script setup lang="ts">
import type { PropType } from 'vue'
import useUserLikedSongsIDs from '@renderer/hooks/useUserLikedSongsIDs'
import useUserAccount from '@renderer/hooks/useUserAccount'

const { data: userAccount } = useUserAccount()
const { data: userLikedSongs } = useUserLikedSongsIDs({
  uid: userAccount.value?.account?.id ?? 0,
})

const props = defineProps({
  /**
   * 歌曲列表
   */
  tracks: {
    type: Array as PropType<Track[]>,
    required: true,
  },
  /**
   * 显示多少列，超出的会被隐藏
   */
  col: {
    type: Number,
    required: false,
    default: 4,
  },
  /**
   * 布局类型
   */
  layout: {
    type: String as PropType<'grid' | 'list' | 'album'>,
    default: 'grid',
  },
  /**
   * 是否正在加载数据中（加载中时会显示Skeleton）
   */
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// 计算grid的列数
const gridCols = computed(() => {
  let col =
    {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    }[props.col] || ''
  if (props.layout !== 'grid') {
    col = 'grid-cols-1'
  }
  return {
    [col]: true,
  }
})

// 用于填充Skeleton的假数据
const skeletonTracks: Track[] = new Array(props.layout === 'list' ? 7 : 8).fill(
  {}
)
</script>

<template>
  <div
    v-if="!isLoading"
    class="grid w-full gap-1"
    :class="{ ...gridCols, 'gap-0': layout === 'album' }"
  >
    <TrackListItem
      v-for="track in tracks"
      :track="track"
      :fullWidth="layout !== 'grid'"
      :layout="layout"
      :isLiked="userLikedSongs?.ids?.includes(track.id)"
    />
  </div>
  <div v-else class="grid w-full gap-1" :class="{ ...gridCols }">
    <TrackListItem
      v-for="track in skeletonTracks"
      :track="track"
      :layout="layout"
      :fullWidth="layout !== 'grid'"
      :isSkeleton="true"
    />
  </div>
</template>
