import { fetchPersonalFM, PersonalFMApiNames } from '@/renderer/api/personalFM'
import reactQueryClient from '@/renderer/utils/reactQueryClient'

export function fetchPersonalFMWithReactQuery() {
  return reactQueryClient.fetchQuery(
    PersonalFMApiNames.FetchPersonalFm,
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
