import { fetchPlaylist } from '@renderer/api/playlist'
import { PlaylistApiNames } from '@renderer/api/playlist'
import type { FetchPlaylistParams } from '@renderer/api/playlist'

export default function usePlaylist(
  params: FetchPlaylistParams,
  noCache: boolean = false
) {
  console.debug('usePlaylist', params)
  const enabled = computed(
    () => !!params.id && params.id > 0 && !isNaN(Number(params.id))
  )
  return useQuery(
    reactive([PlaylistApiNames.FETCH_PLAYLIST, params]),
    () => fetchPlaylist(params, noCache),
    reactive({ enabled })
  )
}
