import { fetchUserAccount } from '@/web/api/user'
import { UserApiNames, FetchUserAccountResponse } from '@/shared/api/User'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useMutation, useQuery } from '@tanstack/react-query'
import { logout } from '../auth'
import { removeAllCookies } from '@/web/utils/cookie'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useUser() {
  const key = [UserApiNames.FetchUserAccount]
  return useQuery(
    key,
    async () => {
      const existsQueryData = reactQueryClient.getQueryData(key)
      if (!existsQueryData) {
        window.ipcRenderer
          ?.invoke(IpcChannels.GetApiCache, {
            api: CacheAPIs.UserAccount,
          })
          .then(cache => {
            if (cache) reactQueryClient.setQueryData(key, cache)
          })
      }

      return fetchUserAccount()
    },
    {
      refetchOnWindowFocus: true,
    }
  )
}

export const useMutationLogout = () => {
  const { refetch } = useUser()
  return useMutation(async () => {
    await logout()
    removeAllCookies()
    await window.ipcRenderer?.invoke(IpcChannels.Logout)
    await refetch()
  })
}
