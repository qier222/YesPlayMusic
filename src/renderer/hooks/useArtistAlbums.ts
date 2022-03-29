import { fetchArtistAlbums } from '@/api/artist'
import { ArtistApiNames } from '@/api/artist'
import type {
  FetchArtistAlbumsParams,
  FetchArtistAlbumsResponse,
} from '@/api/artist'

export default function useUserAlbums(params: FetchArtistAlbumsParams) {
  return useQuery(
    [ArtistApiNames.FETCH_ARTIST_ALBUMS, params],
    async () => {
      const data = await fetchArtistAlbums(params)
      return data
    },
    {
      enabled: !!params.id && params.id !== 0,
      staleTime: 3600000,
      placeholderData: (): FetchArtistAlbumsResponse =>
        window.ipcRenderer?.sendSync('getApiCacheSync', {
          api: 'artist/album',
          query: {
            id: params.id,
          },
        }),
    }
  )
}
