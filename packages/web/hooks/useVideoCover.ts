import { IpcChannels } from '@/shared/IpcChannels'
import axios from 'axios'
import { useQuery } from 'react-query'

export default function useVideoCover(props: {
  id?: number
  name?: string
  artist?: string
}) {
  const { id, name, artist } = props
  return useQuery(
    ['useVideoCover', props],
    async () => {
      if (!id || !name || !artist) return

      const fromCache = window.ipcRenderer?.sendSync(
        IpcChannels.GetVideoCover,
        {
          id,
        }
      )
      if (fromCache) {
        return fromCache === 'no' ? undefined : fromCache
      }

      const fromRemote = await axios.get('/yesplaymusic/video-cover', {
        params: props,
      })
      window.ipcRenderer?.send(IpcChannels.SetVideoCover, {
        id,
        url: fromRemote.data.url || '',
      })
      if (fromRemote?.data?.url) {
        return fromRemote.data.url
      }
    },
    {
      enabled: !!id && !!name && !!artist,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
