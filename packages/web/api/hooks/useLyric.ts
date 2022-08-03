import { fetchLyric } from '@/web/api/track'
import reactQueryClient from '@/web/utils/reactQueryClient'
import {
  FetchLyricParams,
  FetchLyricResponse,
  TrackApiNames,
} from '@/shared/api/Track'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'

export default function useLyric(params: FetchLyricParams) {
  return useQuery(
    [TrackApiNames.FetchLyric, params],
    () => {
      return fetchLyric(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
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
    [TrackApiNames.FetchLyric, params],
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
