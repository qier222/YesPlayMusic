import ArtistInline from '@/components/ArtistsInline'
import IconButton from '@/components/IconButton'
import Slider from '@/components/Slider'
import SvgIcon from '@/components/SvgIcon'
import { player } from '@/store'
import { resizeImage } from '@/utils/common'
import { State as PlayerState, Mode as PlayerMode } from '@/utils/player'

const PlayingTrack = () => {
  const navigate = useNavigate()
  const snappedPlayer = useSnapshot(player)
  const track = useMemo(() => snappedPlayer.track, [snappedPlayer.track])
  const trackListSource = useMemo(
    () => snappedPlayer.trackListSource,
    [snappedPlayer.trackListSource]
  )

  const toAlbum = () => {
    const id = track?.al?.id
    if (id) navigate(`/album/${id}`)
  }

  const toTrackListSource = () => {
    if (trackListSource?.type)
      navigate(`/${trackListSource.type}/${trackListSource.id}`)
  }

  return (
    <>
      {track && (
        <div className='flex items-center gap-3'>
          {track?.al?.picUrl && (
            <img
              onClick={toAlbum}
              className='aspect-square h-full rounded-md shadow-md'
              src={resizeImage(track?.al?.picUrl ?? '', 'sm')}
            />
          )}
          {!track?.al?.picUrl && (
            <div
              onClick={toAlbum}
              className='flex aspect-square h-full items-center justify-center rounded-md bg-black/[.04] shadow-sm'
            >
              <SvgIcon className='h-6 w-6 text-gray-300' name='music-note' />
            </div>
          )}

          <div className='flex flex-col justify-center leading-tight'>
            <div
              onClick={toTrackListSource}
              className='line-clamp-1 font-semibold text-black decoration-gray-600 decoration-2 hover:underline dark:text-white dark:decoration-gray-300'
            >
              {track?.name}
            </div>
            <div className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              <ArtistInline artists={track?.ar ?? []} />
            </div>
          </div>

          <IconButton onClick={() => toast('Work in progress')}>
            <SvgIcon
              className='h-6 w-6 text-black dark:text-white'
              name='heart-outline'
            />
          </IconButton>
        </div>
      )}
      {!track && <div></div>}
    </>
  )
}

const MediaControls = () => {
  const playerSnapshot = useSnapshot(player)
  const state = useMemo(() => playerSnapshot.state, [playerSnapshot.state])
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const mode = useMemo(() => playerSnapshot.mode, [playerSnapshot.mode])
  return (
    <div className='flex items-center justify-center gap-2 text-black dark:text-white'>
      {mode === PlayerMode.PLAYLIST ? (
        <IconButton
          onClick={() => track && player.prevTrack()}
          disabled={!track}
        >
          <SvgIcon className='h-6 w-6' name='previous' />
        </IconButton>
      ) : (
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

const Others = () => {
  return (
    <div className='flex items-center justify-end gap-2 pr-2 text-black dark:text-white'>
      <IconButton onClick={() => toast('Work in progress')}>
        <SvgIcon className='h-6 w-6' name='playlist' />
      </IconButton>
      <IconButton onClick={() => toast('Work in progress')}>
        <SvgIcon className='h-6 w-6' name='repeat' />
      </IconButton>
      <IconButton onClick={() => toast('Work in progress')}>
        <SvgIcon className='h-6 w-6' name='shuffle' />
      </IconButton>
      <IconButton onClick={() => toast('Work in progress')}>
        <SvgIcon className='h-6 w-6' name='volume' />
      </IconButton>
      <IconButton onClick={() => toast('Work in progress')}>
        <SvgIcon className='h-6 w-6' name='lyrics' />
      </IconButton>
    </div>
  )
}

const Progress = () => {
  const playerSnapshot = useSnapshot(player)
  const progress = useMemo(
    () => playerSnapshot.progress,
    [playerSnapshot.progress]
  )
  const state = useMemo(() => playerSnapshot.state, [playerSnapshot.state])
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  return (
    <div className='absolute w-screen'>
      {track && (
        <Slider
          min={0}
          max={(track.dt ?? 0) / 1000}
          value={
            state === PlayerState.PLAYING || state === PlayerState.PAUSED
              ? progress
              : 0
          }
          onChange={value => {
            player.progress = value
          }}
          onlyCallOnChangeAfterDragEnded={true}
        />
      )}
      {!track && (
        <div className='absolute h-[2px] w-full bg-gray-500 bg-opacity-10'></div>
      )}
    </div>
  )
}

const Player = () => {
  return (
    <div className='fixed bottom-0 left-0 right-0 grid h-16 grid-cols-3 grid-rows-1 bg-white bg-opacity-[.86] py-2.5 px-5 backdrop-blur-xl backdrop-saturate-[1.8] dark:bg-[#222] dark:bg-opacity-[.86]'>
      <Progress />

      <PlayingTrack />
      <MediaControls />
      <Others />
    </div>
  )
}

export default Player
