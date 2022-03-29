import type {
  FetchUserLikedSongsIDsParams,
  FetchUserLikedSongsIDsResponse,
} from '@/api/user'
import { UserApiNames, fetchUserLikedSongsIDs } from '@/api/user'

export default function useUserLikedSongsIDs(
  params: FetchUserLikedSongsIDsParams
) {
  return useQuery(
    [UserApiNames.FETCH_USER_LIKED_SONGS_IDS, params],
    () => fetchUserLikedSongsIDs(params),
    {
      enabled: !!(params.uid && params.uid !== 0),
      refetchOnWindowFocus: true,
      // placeholderData: (): FetchUserLikedSongsIDsResponse | undefined =>
      //   window.ipcRenderer.sendSync('getApiCacheSync', {
      //     api: 'likelist',
      //     query: {
      //       uid: params.uid,
      //     },
      //   }),
    }
  )
}
