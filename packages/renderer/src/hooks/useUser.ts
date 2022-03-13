import { fetchUserAccount } from '@/api/user'
import { UserApiNames } from '@/api/user'

export default function useUser() {
  return useQuery(UserApiNames.FETCH_USER_ACCOUNT, fetchUserAccount, {
    refetchOnWindowFocus: true,
  })
}
