import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/hooks/useUserLikedTracksIDs'
import { player, state } from '@/store'
import { resizeImage } from '@/utils/common'

import ArtistInline from '../ArtistsInline'
import Cover from '../Cover'
import IconButton from '../IconButton'
import SvgIcon from '../SvgIcon'
import { State as PlayerState, Mode as PlayerMode } from '@/utils/player'

const PlayingTrack = () => {
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const navigate = useNavigate()

  const toAlbum = () => {
    const id = track?.al?.id
    if (!id) return
    navigate(`/album/${id}`)
    state.uiStates.showLyricPanel = false
  }

  const trackListSource = useMemo(
    () => playerSnapshot.trackListSource,
    [playerSnapshot.trackListSource]
  )
  const toTrackListSource = () => {
    if (!trackListSource?.type) return

    navigate(`/${trackListSource.type}/${trackListSource.id}`)
    state.uiStates.showLyricPanel = false
  }

  return (
    <div>
      <div
        onClick={toTrackListSource}
        className='line-clamp-1 text-[22px] font-semibold text-white hover:underline'
      >
        {track?.name}
      </div>
      <div className='line-clamp-1 -mt-0.5 inline-flex max-h-7 text-white opacity-60'>
        <ArtistInline artists={track?.ar ?? []} />
        <span>
          {' '}
          -{' '}
          <span onClick={toAlbum} className='hover:underline'>
            {track?.al.name}
          </span>
        </span>
      </div>
    </div>
  )
}

const LikeButton = ({ track }: { track: Track | undefined | null }) => {
  const { data: userLikedSongs } = useUserLikedTracksIDs()
  const mutationLikeATrack = useMutationLikeATrack()

  return (
    <div className='mr-1 '>
      <IconButton
        onClick={() => track?.id && mutationLikeATrack.mutate(track.id)}
      >
        <SvgIcon
          className='h-6 w-6 text-white'
          name={
            track?.id && userLikedSongs?.ids?.includes(track.id)
              ? 'heart'
              : 'heart-outline'
          }
        />
      </IconButton>
    </div>
  )
}

const Controls = () => {
  const playerSnapshot = useSnapshot(player)
  const state = useMemo(() => playerSnapshot.state, [playerSnapshot.state])
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const mode = useMemo(() => playerSnapshot.mode, [playerSnapshot.mode])

  return (
    <div className='flex items-center justify-center gap-2 text-white'>
      {mode === PlayerMode.PLAYLIST && (
        <IconButton
          onClick={() => track && player.prevTrack()}
          disabled={!track}
        >
          <SvgIcon className='h-6 w-6' name='previous' />
        </IconButton>
      )}
      {mode === PlayerMode.FM && (
        <IconButton onClick={() => player.fmTrash()}>
          <SvgIcon className='h-6 w-6' name='dislike' />
        </IconButton>
      )}
      <IconButton
        onClick={() => track && player.playOrPause()}
        disabled={!track}
        className='after:rounded-xl'
      >
        <SvgIcon
          className='h-7 w-7'
          name={
            [PlayerState.PLAYING, PlayerState.LOADING].includes(state)
              ? 'pause'
              : 'play'
          }
        />
      </IconButton>
      <IconButton onClick={() => track && player.nextTrack()} disabled={!track}>
        <SvgIcon className='h-6 w-6' name='next' />
      </IconButton>
    </div>
  )
}

const Player = ({ className }: { className?: string }) => {
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  return (
    <div
      className={classNames('flex w-full items-center justify-end', className)}
    >
      <div className='relative w-[74%]'>
        <Cover
          imageUrl={resizeImage(track?.al.picUrl ?? '', 'lg')}
          roundedClass='rounded-2xl'
          alwaysShowShadow={true}
        />
        <div className='absolute -bottom-32 right-0 left-0'>
          <div className='mt-6 flex cursor-default justify-between'>
            <PlayingTrack />
            <LikeButton track={track} />
          </div>

          <Controls />
        </div>
      </div>
    </div>
  )
}

export default Player
