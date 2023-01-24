import { useQuery } from '@tanstack/react-query'
import { fetchAppleMusicArtist } from '../appleMusic'

const useAppleMusicArtist = (id: string | number) => {
  return useQuery(
    ['useAppleMusicArtist', id],
    async () => {
      if (!id) return
      return fetchAppleMusicArtist({ neteaseId: id })
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}

export default useAppleMusicArtist
