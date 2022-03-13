import type { FetchUserPlaylistsParams } from '@/api/user'
import { UserApiNames, fetchUserPlaylists } from '@/api/user'

export default function useUserPlaylists(params: FetchUserPlaylistsParams) {
  return useQuery(
    [UserApiNames.FETCH_USER_PLAYLISTS, params],
    async () => {
      const data = await fetchUserPlaylists(params)
      return data
    },
    {
      enabled: !!(
        !!params.uid &&
        params.uid !== 0 &&
        params.offset !== undefined
      ),
    }
  )
}
