import { fetchLyric } from '@/web/api/track'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { FetchLyricParams, TrackApiNames } from '@/shared/api/Track'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'

export default function useLyric(params: FetchLyricParams) {
  const key = [TrackApiNames.FetchLyric, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as initial data
      const cache = window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: APIs.Lyric,
        query: {
          id: params.id,
        },
      })

      if (cache) return cache

      return fetchLyric(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  )
}

export function fetchLyricWithReactQuery(params: FetchLyricParams) {
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
