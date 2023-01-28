import { fetchArtistAlbums } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { FetchArtistAlbumsParams, ArtistApiNames } from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useArtistAlbums(params: FetchArtistAlbumsParams) {
  const key = [ArtistApiNames.FetchArtistAlbums, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      window.ipcRenderer
        ?.invoke(IpcChannels.GetApiCache, {
          api: CacheAPIs.ArtistAlbum,
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

      return fetchArtistAlbums(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      staleTime: 3600000,
    }
  )
}
