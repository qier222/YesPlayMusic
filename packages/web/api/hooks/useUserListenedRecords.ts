import { fetchListenedRecords } from '@/web/api/user'
import { UserApiNames, FetchListenedRecordsResponse } from '@/shared/api/User'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'
import useUser from './useUser'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useUserListenedRecords(params: { type: 'week' | 'all' }) {
  const { data: user } = useUser()
  const uid = user?.account?.id || 0
  const key = [UserApiNames.FetchListenedRecords, uid]

  return useQuery(
    key,
    () => {
      const existsQueryData = reactQueryClient.getQueryData(key)
      if (!existsQueryData) {
        window.ipcRenderer
          ?.invoke(IpcChannels.GetApiCache, {
            api: CacheAPIs.ListenedRecords,
          })
          .then(cache => {
            if (cache) reactQueryClient.setQueryData(key, cache)
          })
      }

      return fetchListenedRecords({
        uid,
        type: params.type === 'week' ? 1 : 0,
      })
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!uid,
    }
  )
}
