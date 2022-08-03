import { fetchPersonalFM, PersonalFMApiNames } from '@/web/api/personalFM'
import reactQueryClient from '@/web/utils/reactQueryClient'

export function fetchPersonalFMWithReactQuery() {
  return reactQueryClient.fetchQuery(
    [PersonalFMApiNames.FetchPersonalFm],
    async () => {
      const data = await fetchPersonalFM()
      if (!data.data?.length) {
        throw new Error('No data')
      }
      return data
    },
    {
      retry: 3,
    }
  )
}
