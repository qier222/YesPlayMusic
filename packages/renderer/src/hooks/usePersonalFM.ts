import { fetchPersonalFM, PersonalFMApiNames } from '@/api/personalFM'
import reactQueryClient from '@/utils/reactQueryClient'

export function fetchPersonalFMWithReactQuery() {
  return reactQueryClient.fetchQuery(
    PersonalFMApiNames.FETCH_PERSONAL_FM,
    () => {
      return fetchPersonalFM()
    },
    {
      retry: 3,
    }
  )
}
