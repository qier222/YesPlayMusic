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
    if (player.mode === PlayerMode.FM) {
      player.playOrPause()
    } else {
      player.playPersonalFM()
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
            player.mode === PlayerMode.FM &&
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
  const [coverUrl, setCoverUrl] = useState('')
  const [background, setBackground] = useState('')

  const playerSnapshot = useSnapshot(player)
  const track = useMemo(
    () => playerSnapshot.personalFMTrack,
    [playerSnapshot.personalFMTrack]
  )

  useEffect(() => {
    setCoverUrl(resizeImage(track?.al?.picUrl ?? '', 'md'))
  }, [track])

  useEffect(() => {
    if (coverUrl) {
      average(coverUrl, { amount: 1, format: 'hex', sample: 1 }).then(color => {
        const to = colord(color as string)
          .darken(0.15)
          .rotate(-5)
          .toHex()
        setBackground(`linear-gradient(to bottom right, ${color}, ${to})`)
      })
    } else {
      setBackground(`linear-gradient(to bottom right, #66ccff, #ee0000)`)
    }
  }, [coverUrl])

  return (
    <div
      className='relative flex h-[198px] overflow-hidden rounded-2xl p-4'
      style={{ background }}
    >
      {coverUrl && <img className='rounded-lg shadow-2xl' src={coverUrl} />}

      <div className='ml-5 flex w-full flex-col justify-between text-white'>
        {/* Track info */}
        <div>
          <div className='text-xl font-semibold'>{track?.name}</div>
          <ArtistInline
            className='opacity-75'
            artists={track?.ar ?? []}
            clampLine={false}
          />
        </div>

        <div className='-mb-1 flex items-center justify-between'>
          <MediaControls />

          {/* FM logo */}
          <div className='right-4 bottom-5 flex text-white opacity-20'>
            <SvgIcon name='fm' className='mr-1 h-6 w-6' />
            <span className='font-semibold'>私人FM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FMCard
