import { fetchListenedRecords } from '@/web/api/user'
import { UserApiNames, FetchListenedRecordsResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from 'react-query'
import useUser from './useUser'

export default function useUserListenedRecords(params: {
  type: 'week' | 'all'
}) {
  const { data: user } = useUser()
  const uid = user?.account?.id || 0

  return useQuery(
    [UserApiNames.FetchListenedRecords],
    () =>
      fetchListenedRecords({
        uid,
        type: params.type === 'week' ? 1 : 0,
      }),
    {
      refetchOnWindowFocus: false,
      enabled: !!uid,
      placeholderData: (): FetchListenedRecordsResponse =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.UserArtists,
        }),
    }
  )
}
