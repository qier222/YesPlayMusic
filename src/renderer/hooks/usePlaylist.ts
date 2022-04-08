import { fetchPlaylist } from '@/renderer/api/playlist'
import { PlaylistApiNames } from '@/renderer/api/playlist'
import type {
  FetchPlaylistParams,
  FetchPlaylistResponse,
} from '@/renderer/api/playlist'
import reactQueryClient from '@/renderer/utils/reactQueryClient'
import { IpcChannels } from '@/main/IpcChannelsName'

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
          api: 'playlist/detail',
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
