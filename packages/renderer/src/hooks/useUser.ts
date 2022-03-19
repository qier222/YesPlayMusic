import { fetchUserAccount, fetchUserAccountResponse } from '@/api/user'
import { UserApiNames } from '@/api/user'

export default function useUser() {
  return useQuery(UserApiNames.FETCH_USER_ACCOUNT, fetchUserAccount, {
    refetchOnWindowFocus: true,
    placeholderData: (): fetchUserAccountResponse | undefined =>
      window.ipcRenderer.sendSync('getApiCacheSync', {
        api: 'user/account',
      }),
  })
}
