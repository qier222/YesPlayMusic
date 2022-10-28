import { fetchPlaylist } from '@/web/api/playlist'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchPlaylistParams,
  PlaylistApiNames,
  FetchPlaylistResponse,
} from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'

const fetch = (params: FetchPlaylistParams) => {
  return fetchPlaylist(params)
}

export const fetchFromCache = async (
  params: FetchPlaylistParams
): Promise<FetchPlaylistResponse | undefined> =>
  window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
    api: APIs.Playlist,
    query: params,
  })

export default function usePlaylist(params: FetchPlaylistParams) {
  const key = [PlaylistApiNames.FetchPlaylist, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      fetchFromCache(params).then(cache => {
        const existsQueryData = reactQueryClient.getQueryData(key)
        if (!existsQueryData && cache) {
          reactQueryClient.setQueryData(key, cache)
        }
      })

      return fetch(params)
    },
    {
      enabled: !!(params.id && params.id > 0 && !isNaN(Number(params.id))),
      refetchOnWindowFocus: true,
    }
  )
}

export function fetchPlaylistWithReactQuery(params: FetchPlaylistParams) {
  return reactQueryClient.fetchQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}

export async function prefetchPlaylist(params: FetchPlaylistParams) {
  if (await fetchFromCache(params)) return
  await reactQueryClient.prefetchQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}
