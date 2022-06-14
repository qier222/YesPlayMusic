import { IpcChannels } from '@/shared/IpcChannels'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/api/hooks/useUserLikedTracksIDs'
import { player } from '@/web/store'
import useIpcRenderer from '@/web/hooks/useIpcRenderer'
import { State as PlayerState } from '@/web/utils/player'
import { useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { useSnapshot } from 'valtio'

const IpcRendererReact = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const { track, state } = useSnapshot(player)
  const trackIDRef = useRef(0)

  // Liked songs ids
  const { data: userLikedSongs } = useUserLikedTracksIDs()
  const mutationLikeATrack = useMutationLikeATrack()

  useIpcRenderer(IpcChannels.Like, () => {
    const id = trackIDRef.current
    id && mutationLikeATrack.mutate(id)
  })

  useEffect(() => {
    trackIDRef.current = track?.id ?? 0

    const text = track?.name ? `${track.name} - YesPlayMusic` : 'YesPlayMusic'
    window.ipcRenderer?.send(IpcChannels.SetTrayTooltip, {
      text,
    })
    document.title = text
  }, [track])

  useEffect(() => {
    window.ipcRenderer?.send(IpcChannels.Like, {
      isLiked: userLikedSongs?.ids?.includes(track?.id ?? 0) ?? false,
    })
  }, [userLikedSongs, track])

  useEffect(() => {
    const playing = [PlayerState.Playing, PlayerState.Loading].includes(state)
    if (isPlaying === playing) return

    window.ipcRenderer?.send(playing ? IpcChannels.Play : IpcChannels.Pause)
    setIsPlaying(playing)
  }, [isPlaying, state])

  useEffectOnce(() => {
    // 用于显示 windows taskbar buttons
    if (track?.id) {
      window.ipcRenderer?.send(IpcChannels.Pause)
    }
  })

  return <></>
}

export default IpcRendererReact
