import { fetchUserLikedSongsIDs } from '@renderer/api/user'
import { UserApiNames } from '@renderer/api/user'
import type { FetchUserLikedSongsIDsParams } from '@renderer/api/user'

export default function useUserLikedSongsIDs(
  params: FetchUserLikedSongsIDsParams
) {
  const enabled = computed(() => !!params.uid && params.uid !== 0)
  return useQuery(
    reactive([UserApiNames.FETCH_USER_LIKED_SONGS_IDS, params]),
    () => {
      return fetchUserLikedSongsIDs(params)
    },
    reactive({ enabled })
  )
}
