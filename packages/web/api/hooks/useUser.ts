import { fetchUserAccount } from '@/web/api/user'
import { UserApiNames, FetchUserAccountResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from 'react-query'

export default function useUser() {
  return useQuery(UserApiNames.FetchUserAccount, fetchUserAccount, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserAccountResponse | undefined =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: APIs.UserAccount,
      }),
  })
}
