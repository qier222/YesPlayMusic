import { useQuery } from '@tanstack/react-query'
import { fetchAppleMusicAlbum } from '../appleMusic'

const useAppleMusicAlbum = (id: string | number) => {
  return useQuery(
    ['useAppleMusicAlbum', id],
    async () => {
      if (!id) return
      return fetchAppleMusicAlbum({ neteaseId: id })
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}

export default useAppleMusicAlbum
