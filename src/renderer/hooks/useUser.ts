import { fetchUserAccount } from '@/renderer/api/user'
import { UserApiNames, FetchUserAccountResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'

export default function useUser() {
  return useQuery(UserApiNames.FETCH_USER_ACCOUNT, fetchUserAccount, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserAccountResponse | undefined =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: APIs.UserAccount,
      }),
  })
}
