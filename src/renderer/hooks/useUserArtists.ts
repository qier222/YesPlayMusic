import { fetchUserArtists } from '@/renderer/api/user'
import { UserApiNames, FetchUserArtistsResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'

export default function useUserArtists() {
  return useQuery([UserApiNames.FETCH_USER_ARTIST], fetchUserArtists, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserArtistsResponse =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: APIs.UserArtists,
      }),
  })
}
