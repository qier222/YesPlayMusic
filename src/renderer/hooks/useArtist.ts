import { fetchArtist } from '@renderer/api/artist'
import { ArtistApiNames } from '@renderer/api/artist'
import type { FetchArtistParams } from '@renderer/api/artist'

export default function useArtist(
  params: FetchArtistParams,
  noCache: boolean = false
) {
  console.debug('useArtist', params)
  const enabled = computed(
    () => !!params.id && params.id > 0 && !isNaN(Number(params.id))
  )
  return useQuery(
    reactive([ArtistApiNames.FETCH_ARTIST, params]),
    () => fetchArtist(params, noCache),
    reactive({ enabled })
  )
}
