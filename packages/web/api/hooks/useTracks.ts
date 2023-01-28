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
import { CacheAPIs } from '@/shared/CacheAPIs'
import { useQuery } from '@tanstack/react-query'

export default function useTracks(params: FetchTracksParams) {
  return useQuery(
    [TrackApiNames.FetchTracks, params],
    async () => {
      // fetch from cache as initial data
      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: CacheAPIs.Track,
        query: {
          ids: params.ids.join(','),
        },
      })
      if (cache) return cache

      return fetchTracks(params)
    },
    {
      enabled: params.ids.length !== 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  )
}

export function fetchTracksWithReactQuery(params: FetchTracksParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchTracks, params],
    async () => {
      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: CacheAPIs.Track,
        query: {
          ids: params.ids.join(','),
        },
      })
      if (cache) return cache as FetchTracksResponse
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
