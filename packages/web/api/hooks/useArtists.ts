import { fetchArtist } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import { ArtistApiNames } from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useArtists(ids: number[]) {
  return useQuery(
    ['fetchArtists', ids],
    () =>
      Promise.all(
        ids.map(async id => {
          const queryData = reactQueryClient.getQueryData([
            ArtistApiNames.FetchArtist,
            { id },
          ])
          if (queryData) return queryData

          const cache = await window.ipcRenderer?.invoke(
            IpcChannels.GetApiCache,
            {
              api: APIs.Artist,
              query: {
                id,
              },
            }
          )
          if (cache) return cache

          return fetchArtist({ id })
        })
      ),
    {
      enabled: !!ids && ids.length > 0,
      staleTime: 5 * 60 * 1000, // 5 mins
    }
  )
}
