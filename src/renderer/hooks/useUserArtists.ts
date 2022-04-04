import type { FetchUserArtistsResponse } from '@/api/user'
import { UserApiNames, fetchUserArtists } from '@/api/user'

export default function useUserArtists() {
  return useQuery([UserApiNames.FETCH_USER_ARTIST], fetchUserArtists, {
    placeholderData: (): FetchUserArtistsResponse =>
      window.ipcRenderer?.sendSync('getApiCacheSync', {
        api: 'album/sublist',
      }),
  })
}
