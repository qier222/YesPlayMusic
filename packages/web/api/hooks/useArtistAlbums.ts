import { fetchArtistAlbums } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchArtistAlbumsParams,
  ArtistApiNames,
  FetchArtistAlbumsResponse,
} from '@/shared/api/Artist'
import { useQuery } from 'react-query'

export default function useUserAlbums(params: FetchArtistAlbumsParams) {
  return useQuery(
    [ArtistApiNames.FetchArtistAlbums, params],
    async () => {
      const data = await fetchArtistAlbums(params)
      return data
    },
    {
      enabled: !!params.id && params.id !== 0,
      staleTime: 3600000,
      placeholderData: (): FetchArtistAlbumsResponse =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.ArtistAlbum,
          query: {
            id: params.id,
          },
        }),
    }
  )
}
