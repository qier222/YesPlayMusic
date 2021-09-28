import { fetchArtistAlbums } from '@renderer/api/artist'
import { ArtistApiNames } from '@renderer/api/artist'
import type { FetchArtistAlbumsParams } from '@renderer/api/artist'

export default function useUserAlbums(params: FetchArtistAlbumsParams) {
  console.debug('useUserAlbums', params)
  const enabled = computed(() => !!params.id && params.id !== 0)
  return useQuery(
    reactive([ArtistApiNames.FETCH_ARTIST_ALBUMS, params]),
    async () => {
      const data = await fetchArtistAlbums(params)
      return data
    },
    reactive({
      enabled,
    })
  )
}
