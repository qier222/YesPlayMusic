import { fetchUserAccount, fetchUserAccountResponse } from '@/renderer/api/user'
import { UserApiNames } from '@/renderer/api/user'
import { IpcChannels } from '@/main/IpcChannelsName'

export default function useUser() {
  return useQuery(UserApiNames.FETCH_USER_ACCOUNT, fetchUserAccount, {
    refetchOnWindowFocus: true,
    placeholderData: (): fetchUserAccountResponse | undefined =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: 'user/account',
      }),
  })
}
