import { TrackApiNames, fetchLyric } from '@/api/track'
import type { FetchLyricParams, FetchLyricResponse } from '@/api/track'
import reactQueryClient from '@/utils/reactQueryClient'

export default function useLyric(params: FetchLyricParams) {
  return useQuery(
    [TrackApiNames.FETCH_LYRIC, params],
    () => {
      return fetchLyric(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      refetchInterval: false,
      staleTime: Infinity,
      initialData: (): FetchLyricResponse | undefined =>
        window.ipcRenderer?.sendSync('getApiCacheSync', {
          api: 'lyric',
          query: {
            id: params.id,
          },
        }),
    }
  )
}

export function fetchTracksWithReactQuery(params: FetchLyricParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FETCH_LYRIC, params],
    () => {
      return fetchLyric(params)
    },
    {
      retry: 4,
      retryDelay: (retryCount: number) => {
        return retryCount * 500
      },
      staleTime: Infinity,
    }
  )
}
