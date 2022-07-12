import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from 'react-query'

export default function useAppleMusicAlbum(props: {
  id?: number
  name?: string
  artist?: string
}) {
  const { id, name, artist } = props
  return useQuery(
    ['useAppleMusicAlbum', props],
    async () => {
      if (!id || !name || !artist) return
      return window.ipcRenderer?.invoke(IpcChannels.GetAlbumFromAppleMusic, {
        id,
        name,
        artist,
      })
    },
    {
      enabled: !!id && !!name && !!artist,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
