import { AppleMusicArtist } from '@/shared/AppleMusic'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'

export default function useAppleMusicArtist(props: {
  id?: number
  name?: string
}) {
  const { id, name } = props
  return useQuery(
    ['useAppleMusicArtist', props],
    async () => {
      if (!id || !name) return

      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: APIs.AppleMusicArtist,
        query: {
          id,
        },
      })

      if (cache) return cache

      return window.ipcRenderer?.invoke(IpcChannels.GetArtistFromAppleMusic, {
        id,
        name,
      })
    },
    {
      enabled: !!id && !!name,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
