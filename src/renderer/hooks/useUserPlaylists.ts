import { fetchUserPlaylists } from '@renderer/api/user'
import { UserApiNames } from '@renderer/api/user'
import type { FetchUserPlaylistsParams } from '@renderer/api/user'

export default function useUserPlaylists(params: FetchUserPlaylistsParams) {
  console.debug('useUserPlaylists', params)
  const enabled = computed(
    () => !!params.uid && params.uid !== 0 && params.offset !== undefined
  )
  return useQuery(
    reactive([UserApiNames.FETCH_USER_PLAYLISTS, params]),
    async () => {
      const data = await fetchUserPlaylists(params)
      return data
    },
    reactive({
      enabled,
    })
  )
}
