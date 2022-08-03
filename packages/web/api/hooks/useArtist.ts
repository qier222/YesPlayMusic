import { fetchArtist } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchArtistParams,
  ArtistApiNames,
  FetchArtistResponse,
} from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

const fetchFromCache = (id: number): FetchArtistResponse =>
  window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
    api: APIs.Artist,
    query: {
      id,
    },
  })

export default function useArtist(params: FetchArtistParams) {
  return useQuery(
    [ArtistApiNames.FetchArtist, params],
    () => fetchArtist(params),
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
      placeholderData: () => fetchFromCache(params.id),
    }
  )
}

export function fetchArtistWithReactQuery(params: FetchArtistParams) {
  return reactQueryClient.fetchQuery(
    [ArtistApiNames.FetchArtist, params],
    () => fetchArtist(params),
    {
      staleTime: Infinity,
    }
  )
}

export async function prefetchArtist(params: FetchArtistParams) {
  if (fetchFromCache(params.id)) return
  await reactQueryClient.prefetchQuery(
    [ArtistApiNames.FetchArtist, params],
    () => fetchArtist(params),
    {
      staleTime: Infinity,
    }
  )
}
