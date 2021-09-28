import { useQuery } from 'vue-query'
import { fetchUserAccount } from '@renderer/api/user'
import { UserApiNames } from '@renderer/api/user'

export default function useUserAccount() {
  console.debug('useUserAccount')
  return useQuery(UserApiNames.FETCH_USER_ACCOUNT, async () => {
    const data = await fetchUserAccount()
    return data
  })
}
