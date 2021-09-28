import { fetchAlbum } from '@renderer/api/album'
import { AlbumApiNames } from '@renderer/api/album'
import type { FetchAlbumParams } from '@renderer/api/album'

export default function useAlbum(
  params: FetchAlbumParams,
  noCache: boolean = false
) {
  console.debug('useAlbum', params)
  const enabled = computed(
    () => !!params.id && params.id > 0 && !isNaN(Number(params.id))
  )
  return useQuery(
    reactive([AlbumApiNames.FETCH_ALBUM, params]),
    () => fetchAlbum(params, noCache),
    reactive({ enabled })
  )
}
