import { fetchArtist } from '@/renderer/api/artist'
import { ArtistApiNames } from '@/renderer/api/artist'
import type {
  FetchArtistParams,
  FetchArtistResponse,
} from '@/renderer/api/artist'
import { IpcChannels } from '@/main/IpcChannelsName'

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
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: 'artists',
          query: {
            id: params.id,
          },
        }),
    }
  )
}
