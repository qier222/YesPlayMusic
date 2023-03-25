import { dailyCheckIn, fetchUserAccount } from '@/web/api/user'
import { UserApiNames, FetchUserAccountResponse } from '@/shared/api/User'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useMutation, useQuery } from '@tanstack/react-query'
import { logout as logoutAPI, refreshCookie } from '../auth'
import { removeAllCookies, setCookies } from '@/web/utils/cookie'
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

export function useRefreshCookie() {
  const user = useUser()
  return useQuery(
    [UserApiNames.RefreshCookie],
    async () => {
      const result = await refreshCookie()
      if (result?.code === 200) {
        setCookies(result.cookie)
      }
      return result
    },
    {
      refetchInterval: 1000 * 60 * 30,
      enabled: !!user.data?.profile?.userId,
    }
  )
}

export function useDailyCheckIn() {
  const user = useUser()
  return useQuery(
    [UserApiNames.DailyCheckIn],
    async () => {
      try {
        Promise.allSettled([dailyCheckIn(0), dailyCheckIn(1)])
        return 'ok'
      } catch (e: any) {
        return 'error'
      }
    },
    {
      refetchInterval: 1000 * 60 * 30,
      enabled: !!user.data?.profile?.userId,
    }
  )
}

export const useIsLoggedIn = () => {
  const { data, isLoading } = useUser()
  if (isLoading) return true
  return !!data?.profile?.userId
}

export const logout = async () => {
  await logoutAPI()
  removeAllCookies()
  await window.ipcRenderer?.invoke(IpcChannels.Logout)
  await reactQueryClient.refetchQueries([UserApiNames.FetchUserAccount])
}

export const useMutationLogout = () => {
  return useMutation(logout)
}
