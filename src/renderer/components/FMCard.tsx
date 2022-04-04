import { average } from 'color.js'
import { colord } from 'colord'
import { player } from '@/store'
import { resizeImage } from '@/utils/common'
import SvgIcon from '@/components/SvgIcon'
import ArtistInline from '@/components/ArtistsInline'
import { State as PlayerState, Mode as PlayerMode } from '@/utils/player'

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
            [PlayerState.PLAYING, PlayerState.LOADING].includes(state)
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
  const [background, setBackground] = useState('')

  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.fmTrack, [playerSnapshot.fmTrack])
  const coverUrl = useMemo(
    () => resizeImage(playerSnapshot.fmTrack?.al?.picUrl ?? '', 'md'),
    [playerSnapshot.fmTrack]
  )

  useEffect(() => {
    const cover = resizeImage(playerSnapshot.fmTrack?.al?.picUrl ?? '', 'xs')
    if (cover) {
      average(cover, { amount: 1, format: 'hex', sample: 1 }).then(color => {
        let c = colord(color as string)
        if (c.isLight()) c = c.darken(0.15)
        else if (c.isDark()) c = c.lighten(0.1)
        const to = c.darken(0.15).rotate(-5).toHex()
        setBackground(`linear-gradient(to bottom right, ${c.toHex()}, ${to})`)
      })
    }
  }, [playerSnapshot.fmTrack?.al?.picUrl])

  return (
    <div
      className='relative flex h-[198px] overflow-hidden rounded-2xl bg-gray-100 p-4 dark:bg-gray-800'
      style={{ background }}
    >
      {coverUrl ? (
        <img
          onClick={() => track?.al?.id && navigate(`/album/${track.al.id}`)}
          className='rounded-lg shadow-2xl'
          src={coverUrl}
        />
      ) : (
        <div className='aspect-square h-full rounded-lg bg-gray-200 dark:bg-white/5'></div>
      )}

      <div className='ml-5 flex w-full flex-col justify-between text-white'>
        {/* Track info */}
        <div>
          {track ? (
            <div className='text-xl font-semibold'>{track?.name}</div>
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
