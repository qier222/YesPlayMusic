import { fetchPlaylist } from '@/renderer/api/playlist'
import reactQueryClient from '@/renderer/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchPlaylistParams,
  PlaylistApiNames,
  FetchPlaylistResponse,
} from '@/shared/api/Playlists'

const fetch = (params: FetchPlaylistParams, noCache?: boolean) => {
  return fetchPlaylist(params, !!noCache)
}

export default function usePlaylist(
  params: FetchPlaylistParams,
  noCache?: boolean
) {
  return useQuery(
    [PlaylistApiNames.FETCH_PLAYLIST, params],
    () => fetch(params, noCache),
    {
      enabled: !!(params.id && params.id > 0 && !isNaN(Number(params.id))),
      refetchOnWindowFocus: true,
      placeholderData: (): FetchPlaylistResponse | undefined =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Playlist,
          query: {
            id: params.id,
          },
        }),
    }
  )
}

export function fetchPlaylistWithReactQuery(params: FetchPlaylistParams) {
  return reactQueryClient.fetchQuery(
    [PlaylistApiNames.FETCH_PLAYLIST, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}

export async function prefetchPlaylist(params: FetchPlaylistParams) {
  await reactQueryClient.prefetchQuery(
    [PlaylistApiNames.FETCH_PLAYLIST, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}
