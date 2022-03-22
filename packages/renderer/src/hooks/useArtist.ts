import { fetchArtist } from '@/api/artist'
import { ArtistApiNames } from '@/api/artist'
import type { FetchArtistParams, FetchArtistResponse } from '@/api/artist'

export default function useArtist(
  params: FetchArtistParams,
  noCache?: boolean
) {
  return useQuery(
    [ArtistApiNames.FETCH_ARTIST, params],
    () => fetchArtist(params, !!noCache),
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
      placeholderData: (): FetchArtistResponse =>
        window.ipcRenderer.sendSync('getApiCacheSync', {
          api: 'artists',
          query: {
            id: params.id,
          },
        }),
    }
  )
}
