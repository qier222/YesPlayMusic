import type { FetchUserArtistsResponse } from '@/renderer/api/user'
import { UserApiNames, fetchUserArtists } from '@/renderer/api/user'
import { IpcChannels } from '@/main/IpcChannelsName'

export default function useUserArtists() {
  return useQuery([UserApiNames.FETCH_USER_ARTIST], fetchUserArtists, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserArtistsResponse =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: 'album/sublist',
      }),
  })
}
