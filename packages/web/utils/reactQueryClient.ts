import { QueryClient } from '@tanstack/react-query'

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export default reactQueryClient
