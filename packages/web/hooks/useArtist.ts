import { fetchArtist } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchArtistParams,
  ArtistApiNames,
  FetchArtistResponse,
} from '@/shared/api/Artist'
import { useQuery } from 'react-query'

export default function useArtist(
  params: FetchArtistParams,
  noCache?: boolean
) {
  return useQuery(
    [ArtistApiNames.FetchArtist, params],
    () => fetchArtist(params, !!noCache),
    {
      enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
      staleTime: 5 * 60 * 1000, // 5 mins
      placeholderData: (): FetchArtistResponse =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Artist,
          query: {
            id: params.id,
          },
        }),
    }
  )
}
