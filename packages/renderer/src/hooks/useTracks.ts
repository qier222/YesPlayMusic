import { TrackApiNames, fetchAudioSource, fetchTracks } from '@/api/track'
import type { FetchAudioSourceParams, FetchTracksParams } from '@/api/track'
import reactQueryClient from '@/utils/reactQueryClient'

export default function useTracks(params: FetchTracksParams) {
  return useQuery(
    [TrackApiNames.FETCH_TRACKS, params],
    () => {
      return fetchTracks(params)
    },
    {
      enabled: params.ids.length !== 0,
      refetchInterval: false,
      staleTime: Infinity,
    }
  )
}

export function fetchTracksWithReactQuery(params: FetchTracksParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FETCH_TRACKS, params],
    () => {
      return fetchTracks(params)
    },
    {
      retry: 3,
      staleTime: 86400000,
    }
  )
}

export function fetchAudioSourceWithReactQuery(params: FetchAudioSourceParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FETCH_AUDIO_SOURCE, params],
    () => {
      return fetchAudioSource(params)
    },
    {
      retry: 3,
      staleTime: 1200000,
    }
  )
}
