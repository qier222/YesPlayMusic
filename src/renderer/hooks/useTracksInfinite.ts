import { fetchTracks } from '@renderer/api/track'
import { TrackApiNames } from '@renderer/api/track'
import type { FetchTracksParams } from '@renderer/api/track'

// 20 tracks each page
const offset = 50

export default function useTracksInfinite(params: FetchTracksParams) {
  console.debug('useTracksInfinite', params.ids)
  const enabled = computed(() => params.ids.length !== 0)

  return useInfiniteQuery(
    reactive([TrackApiNames.FETCH_TRACKS, params]),
    ({ pageParam = 0 }) => {
      const cursorStart = pageParam * offset
      const cursorEnd = cursorStart + offset
      const ids = params.ids.slice(cursorStart, cursorEnd)
      return fetchTracks({ ids })
    },
    reactive({
      enabled,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 0,
      getNextPageParam: (lastPage, pages) => {
        // 当 return undefined 时，hasNextPage会等于false
        // 当 return 非 undefined 时，return 的数据会传入上面的fetchTracks函数中
        return pages.length * offset < params.ids.length // 判断是否还有下一页
          ? pages.length
          : undefined
      },
    })
  )
}
