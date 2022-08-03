import { fetchAudioSource, fetchTracks } from '@/web/api/track'
import type {} from '@/web/api/track'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import {
  FetchAudioSourceParams,
  FetchTracksParams,
  FetchTracksResponse,
  TrackApiNames,
} from '@/shared/api/Track'
import { APIs } from '@/shared/CacheAPIs'
import { useQuery } from '@tanstack/react-query'

export default function useTracks(params: FetchTracksParams) {
  return useQuery(
    [TrackApiNames.FetchTracks, params],
    () => {
      return fetchTracks(params)
    },
    {
      enabled: params.ids.length !== 0,
      refetchInterval: false,
      staleTime: Infinity,
      initialData: (): FetchTracksResponse | undefined =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Track,
          query: {
            ids: params.ids.join(','),
          },
        }),
    }
  )
}

export function fetchTracksWithReactQuery(params: FetchTracksParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchTracks, params],
    () => {
      return fetchTracks(params)
    },
    {
      retry: 4,
      retryDelay: (retryCount: number) => {
        return retryCount * 500
      },
      staleTime: 86400000,
    }
  )
}

export function fetchAudioSourceWithReactQuery(params: FetchAudioSourceParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchAudioSource, params],
    () => {
      return fetchAudioSource(params)
    },
    {
      retry: 3,
      staleTime: 0, // TODO: Web版1小时缓存
    }
  )
}
