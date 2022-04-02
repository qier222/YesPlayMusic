import { fetchPersonalFM, PersonalFMApiNames } from '@/api/personalFM'
import reactQueryClient from '@/utils/reactQueryClient'

export function fetchPersonalFMWithReactQuery() {
  return reactQueryClient.fetchQuery(
    PersonalFMApiNames.FETCH_PERSONAL_FM,
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
