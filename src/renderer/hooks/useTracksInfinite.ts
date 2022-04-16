import { FetchTracksParams, TrackApiNames } from '@/shared/api/Track'
import { fetchTracks } from 'api/track'

// 100 tracks each page
const offset = 100

export default function useTracksInfinite(params: FetchTracksParams) {
  return useInfiniteQuery(
    [TrackApiNames.FETCH_TRACKS, params],
    ({ pageParam = 0 }) => {
      const cursorStart = pageParam * offset
      const cursorEnd = cursorStart + offset
      const ids = params.ids.slice(cursorStart, cursorEnd)
      return fetchTracks({ ids })
    },
    {
      enabled: params.ids.length !== 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 0,
      staleTime: Infinity,
      getNextPageParam: (lastPage, pages) => {
        // 当 return undefined 时，hasNextPage会等于false
        // 当 return 非 undefined 时，return 的数据会传入上面的fetchTracks函数中
        return pages.length * offset < params.ids.length // 判断是否还有下一页
          ? pages.length
          : undefined
      },
    }
  )
}
