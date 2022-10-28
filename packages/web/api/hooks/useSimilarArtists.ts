import { fetchSimilarArtists } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import { FetchSimilarArtistsParams, ArtistApiNames } from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useSimilarArtists(params: FetchSimilarArtistsParams) {
  const key = [ArtistApiNames.FetchSimilarArtists, params]
  return useQuery(
    key,
    () => {
      window.ipcRenderer
        ?.invoke(IpcChannels.GetApiCache, {
          api: APIs.SimilarArtist,
          query: {
            id: params.id,
          },
        })
        .then(cache => {
          const existsQueryData = reactQueryClient.getQueryData(key)
          if (!existsQueryData && cache) {
            reactQueryClient.setQueryData(key, cache)
          }
        })

      return fetchSimilarArtists(params)
    },
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
      retry: 0,
    }
  )
}
