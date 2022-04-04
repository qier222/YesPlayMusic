import type { FetchUserAlbumsParams, FetchUserAlbumsResponse } from '@/api/user'
import { UserApiNames, fetchUserAlbums } from '@/api/user'

export default function useUserAlbums(params: FetchUserAlbumsParams) {
  return useQuery(
    [UserApiNames.FETCH_USER_ALBUMS, params],
    () => fetchUserAlbums(params),
    {
      placeholderData: (): FetchUserAlbumsResponse =>
        window.ipcRenderer?.sendSync('getApiCacheSync', {
          api: 'album/sublist',
          query: params,
        }),
    }
  )
}
