import { player } from '@/renderer/store'
import { resizeImage } from '@/renderer/utils/common'
import SvgIcon from './SvgIcon'
import ArtistInline from './ArtistsInline'
import {
  State as PlayerState,
  Mode as PlayerMode,
} from '@/renderer/utils/player'
import useCoverColor from '@/renderer/hooks/useCoverColor'
import Cover from '@/renderer/components/Cover'

const MediaControls = () => {
  const classes =
    'btn-pressed-animation btn-hover-animation mr-1 cursor-default rounded-lg p-1.5 transition duration-200 after:bg-white/10'

  const playerSnapshot = useSnapshot(player)
  const state = useMemo(() => playerSnapshot.state, [playerSnapshot.state])

  const playOrPause = () => {
    if (playerSnapshot.mode === PlayerMode.FM) {
      player.playOrPause()
    } else {
      player.playFM()
    }
  }

  return (
    <div>
      <button
        key='dislike'
        className={classes}
        onClick={() => player.fmTrash()}
      >
        <SvgIcon name='dislike' className='h-6 w-6' />
      </button>

      <button key='play' className={classes} onClick={playOrPause}>
        <SvgIcon
          className='h-6 w-6'
          name={
            playerSnapshot.mode === PlayerMode.FM &&
            [PlayerState.Playing, PlayerState.Loading].includes(state)
              ? 'pause'
              : 'play'
          }
        />
      </button>

      <button
        key='next'
        className={classes}
        onClick={() => player.nextTrack(true)}
      >
        <SvgIcon name='next' className='h-6 w-6' />
      </button>
    </div>
  )
}

const FMCard = () => {
  const navigate = useNavigate()

  const playerSnapshot = useSnapshot(player)
  const track = playerSnapshot.fmTrack

  const bgColor = useCoverColor(track?.al?.picUrl ?? '', '#262626')

  return (
    <div
      className='relative grid h-[198px] grid-cols-[166px_auto] gap-x-4 overflow-hidden rounded-2xl bg-gray-100 p-4 dark:bg-gray-800'
      style={{
        background: `linear-gradient(to bottom, ${bgColor.from}, ${bgColor.to})`,
      }}
    >
      <Cover
        imageUrl={resizeImage(track?.al?.picUrl ?? '', 'md')}
        onClick={() => track?.al?.id && navigate(`/album/${track?.al?.id}`)}
        showHover={false}
        roundedClass='rounded-lg border-0'
      />

      <div className='flex w-full flex-col justify-between text-white'>
        {/* Track info */}
        <div>
          {track ? (
            <div className='line-clamp-2 text-xl font-semibold'>
              {track?.name}
            </div>
          ) : (
            <div className='flex'>
              <div className='bg-gray-200 text-xl text-transparent dark:bg-white/5'>
                PLACEHOLDER12345
              </div>
            </div>
          )}
          {track ? (
            <ArtistInline
              className='line-clamp-2 opacity-75'
              artists={track?.ar ?? []}
            />
          ) : (
            <div className='mt-1 flex'>
              <div className='bg-gray-200 text-transparent dark:bg-white/5'>
                PLACEHOLDER
              </div>
            </div>
          )}
        </div>

        <div className='-mb-1 flex items-center justify-between'>
          {track ? <MediaControls /> : <div className='h-9'></div>}

          {/* FM logo */}
          <div
            className={classNames(
              'right-4 bottom-5 flex opacity-20',
              track ? 'text-white ' : 'text-gray-700 dark:text-white'
            )}
          >
            <SvgIcon name='fm' className='mr-1 h-6 w-6' />
            <span className='font-semibold'>私人FM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FMCard
