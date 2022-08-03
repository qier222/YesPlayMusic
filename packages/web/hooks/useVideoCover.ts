import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

export default function useVideoCover(props: {
  id?: number
  name?: string
  artist?: string
  enabled?: boolean
}) {
  const { id, name, artist, enabled = true } = props
  return useQuery(
    ['useVideoCover', props],
    async () => {
      if (!id || !name || !artist) return

      const fromRemote = await axios.get('/yesplaymusic/video-cover', {
        params: props,
      })
      if (fromRemote?.data?.url) {
        return fromRemote.data.url
      }
    },
    {
      enabled: !!id && !!name && !!artist && enabled,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
