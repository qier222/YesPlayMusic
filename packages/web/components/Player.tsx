import ArtistInline from './ArtistsInline'
import IconButton from './IconButton'
import Slider from './Slider'
import Icon from './Icon'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/api/hooks/useUserLikedTracksIDs'
import { player, state } from '@/web/store'
import { resizeImage } from '@/web/utils/common'
import { State as PlayerState, Mode as PlayerMode } from '@/web/utils/player'
import { RepeatMode as PlayerRepeatMode } from '@/shared/playerDataTypes'
import { cx } from '@emotion/css'
import { useSnapshot } from 'valtio'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const PlayingTrack = () => {
  const navigate = useNavigate()
  const { track, trackListSource, mode } = useSnapshot(player)

  // Liked songs ids
  const { data: userLikedSongs } = useUserLikedTracksIDs()
  const mutationLikeATrack = useMutationLikeATrack()

  const hasTrackListSource = mode !== PlayerMode.FM && trackListSource?.type

  const toAlbum = () => {
    const id = track?.al?.id
    if (id) navigate(`/album/${id}`)
  }

  const toTrackListSource = () => {
    if (hasTrackListSource)
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
              src={resizeImage(track.al.picUrl, 'xs')}
            />
          )}
          {!track?.al?.picUrl && (
            <div
              onClick={toAlbum}
              className='flex aspect-square h-full items-center justify-center rounded-md bg-black/[.04] shadow-sm'
            >
              <Icon className='h-6 w-6 text-gray-300' name='music-note' />
            </div>
          )}

          <div className='flex flex-col justify-center leading-tight'>
            <div
              onClick={toTrackListSource}
              className={cx(
                'line-clamp-1 font-semibold text-black decoration-gray-600 decoration-2 dark:text-white dark:decoration-gray-300',
                hasTrackListSource && 'hover:underline'
              )}
            >
              {track?.name}
            </div>
            <div className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              <ArtistInline artists={track?.ar ?? []} />
            </div>
          </div>

          <IconButton
            onClick={() => track?.id && mutationLikeATrack.mutate(track.id)}
          >
            <Icon
              className='h-5 w-5 text-black dark:text-white'
              name={
                track?.id && userLikedSongs?.ids?.includes(track.id)
                  ? 'heart'
                  : 'heart-outline'
              }
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
      {mode === PlayerMode.TrackList && (
        <IconButton
          onClick={() => track && player.prevTrack()}
          disabled={!track}
        >
          <Icon className='h-6 w-6' name='previous' />
        </IconButton>
      )}
      {mode === PlayerMode.FM && (
        <IconButton onClick={() => player.fmTrash()}>
          <Icon className='h-6 w-6' name='dislike' />
        </IconButton>
      )}
      <IconButton
        onClick={() => track && player.playOrPause()}
        disabled={!track}
        className='after:rounded-xl'
      >
        <Icon
          className='h-7 w-7'
          name={
            [PlayerState.Playing, PlayerState.Loading].includes(state)
              ? 'pause'
              : 'play'
          }
        />
      </IconButton>
      <IconButton onClick={() => track && player.nextTrack()} disabled={!track}>
        <Icon className='h-6 w-6' name='next' />
      </IconButton>
    </div>
  )
}

const Others = () => {
  const playerSnapshot = useSnapshot(player)

  const switchRepeatMode = () => {
    if (playerSnapshot.repeatMode === PlayerRepeatMode.Off) {
      player.repeatMode = PlayerRepeatMode.On
    } else if (playerSnapshot.repeatMode === PlayerRepeatMode.On) {
      player.repeatMode = PlayerRepeatMode.One
    } else {
      player.repeatMode = PlayerRepeatMode.Off
    }
  }

  return (
    <div className='flex items-center justify-end gap-2 pr-2 text-black dark:text-white'>
      <IconButton
        onClick={() => toast('Work in progress')}
        disabled={playerSnapshot.mode === PlayerMode.FM}
      >
        <Icon className='h-6 w-6' name='playlist' />
      </IconButton>
      <IconButton
        onClick={switchRepeatMode}
        disabled={playerSnapshot.mode === PlayerMode.FM}
      >
        <Icon
          className={cx(
            'h-6 w-6',
            playerSnapshot.repeatMode !== PlayerRepeatMode.Off &&
              'text-brand-500'
          )}
          name={
            playerSnapshot.repeatMode === PlayerRepeatMode.One
              ? 'repeat-1'
              : 'repeat'
          }
        />
      </IconButton>
      <IconButton
        onClick={() => toast('施工中...')}
        disabled={playerSnapshot.mode === PlayerMode.FM}
      >
        <Icon className='h-6 w-6' name='shuffle' />
      </IconButton>
      <IconButton onClick={() => toast('施工中...')}>
        <Icon className='h-6 w-6' name='volume' />
      </IconButton>

      {/* Lyric */}
      <IconButton onClick={() => (state.uiStates.showLyricPanel = true)}>
        <Icon className='h-6 w-6' name='lyrics' />
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
            state === PlayerState.Playing || state === PlayerState.Paused
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
