import { IpcChannels } from '@/shared/IpcChannels'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/renderer/hooks/useUserLikedTracksIDs'
import { player } from '@/renderer/store'
import useIpcRenderer from '@/renderer/hooks/useIpcRenderer'
import { State as PlayerState } from '@/renderer/utils/player'

const IpcRendererReact = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const state = useMemo(() => playerSnapshot.state, [playerSnapshot.state])
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
  }, [track])

  useEffect(() => {
    window.ipcRenderer?.send(IpcChannels.SetTrayLikeState, {
      isLiked: userLikedSongs?.ids?.includes(track?.id ?? 0) ?? false,
    })

    let text = track?.name ? `${track.name} - YesPlayMusic` : 'YesPlayMusic'
    window.ipcRenderer?.send(IpcChannels.SetTrayTooltip, {
      text,
    })
    document.title = text
  }, [userLikedSongs, track])

  useEffect(() => {
    const playing = [PlayerState.Playing, PlayerState.Loading].includes(state)
    if (isPlaying === playing) return

    window.ipcRenderer?.send(IpcChannels.SetTrayPlayState, {
      isPlaying: playing,
    })
    setIsPlaying(playing)
  }, [state])

  return <></>
}

export default IpcRendererReact
