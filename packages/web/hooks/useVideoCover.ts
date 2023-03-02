import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { appName } from '../utils/const'
import useSettings from './useSettings'

export default function useVideoCover(props: {
  id?: number
  name?: string
  artist?: string
  enabled?: boolean
}) {
  const { playAnimatedArtworkFromApple } = useSettings()
  const { id, name, artist, enabled = true } = props
  return useQuery(
    ['useVideoCover', props],
    async () => {
      if (!id || !name || !artist) return

      const fromRemote = await axios.get(`/${appName.toLowerCase()}/video-cover`, {
        params: props,
      })
      if (fromRemote?.data?.url) {
        return fromRemote.data.url
      }
    },
    {
      enabled: !!id && !!name && !!artist && enabled && !!playAnimatedArtworkFromApple,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
