import { fetchSimilarArtists } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchSimilarArtistsParams,
  ArtistApiNames,
  FetchSimilarArtistsResponse,
} from '@/shared/api/Artist'
import { useQuery } from 'react-query'

export default function useSimilarArtists(params: FetchSimilarArtistsParams) {
  return useQuery(
    [ArtistApiNames.FetchSimilarArtists, params],
    () => fetchSimilarArtists(params),
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
      placeholderData: (): FetchSimilarArtistsResponse =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.SimilarArtist,
          query: {
            id: params.id,
          },
        }),
    }
  )
}
