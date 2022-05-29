import { fetchUserArtists } from '@/web/api/user'
import { UserApiNames, FetchUserArtistsResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from 'react-query'

export default function useUserArtists() {
  return useQuery([UserApiNames.FetchUserArtist], fetchUserArtists, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserArtistsResponse =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: APIs.UserArtists,
      }),
  })
}
