import { fetchArtist } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { FetchArtistParams, ArtistApiNames, FetchArtistResponse } from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

const fetchFromCache = async (
  params: FetchArtistParams
): Promise<FetchArtistResponse | undefined> =>
  window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
    api: CacheAPIs.Artist,
    query: params,
  })

export default function useArtist(params: FetchArtistParams) {
  const key = [ArtistApiNames.FetchArtist, params]
  return useQuery(
    key,
    () => {
      // fetch from cache as placeholder
      fetchFromCache(params).then(cache => {
        const existsQueryData = reactQueryClient.getQueryData(key)
        if (!existsQueryData && cache) {
          reactQueryClient.setQueryData(key, cache)
        }
      })

      return fetchArtist(params)
    },
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
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
  if (await fetchFromCache(params)) return
  await reactQueryClient.prefetchQuery(
    [ArtistApiNames.FetchArtist, params],
    () => fetchArtist(params),
    {
      staleTime: Infinity,
    }
  )
}
