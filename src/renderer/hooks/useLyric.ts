import { fetchLyric } from '@/renderer/api/track'
import reactQueryClient from '@/renderer/utils/reactQueryClient'
import {
  FetchLyricParams,
  FetchLyricResponse,
  TrackApiNames,
} from '@/shared/api/Track'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'

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
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Lyric,
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
