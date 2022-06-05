import { fetchPlaylist } from '@/web/api/playlist'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchPlaylistParams,
  PlaylistApiNames,
  FetchPlaylistResponse,
} from '@/shared/api/Playlists'
import { useQuery } from 'react-query'

const fetch = (params: FetchPlaylistParams, noCache?: boolean) => {
  return fetchPlaylist(params, !!noCache)
}

export const fetchFromCache = (id: number): FetchPlaylistResponse | undefined =>
  window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
    api: APIs.Playlist,
    query: { id },
  })

export default function usePlaylist(
  params: FetchPlaylistParams,
  noCache?: boolean
) {
  return useQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params, noCache),
    {
      enabled: !!(params.id && params.id > 0 && !isNaN(Number(params.id))),
      refetchOnWindowFocus: true,
      placeholderData: () => fetchFromCache(params.id),
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
  if (fetchFromCache(params.id)) return
  await reactQueryClient.prefetchQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}
