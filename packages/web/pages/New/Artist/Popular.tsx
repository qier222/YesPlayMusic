import { resizeImage } from '@/web/utils/common'
import { player } from '@/web/store'
import { State as PlayerState } from '@/web/utils/player'
import useTracks from '@/web/api/hooks/useTracks'
import { css, cx } from '@emotion/css'
import Image from '@/web/components/New/Image'

const Track = ({
  track,
  isPlaying,
  onPlay,
}: {
  track?: Track
  isPlaying?: boolean
  onPlay: (id: number) => void
}) => {
  return (
    <div
      className='flex items-center justify-between'
      onClick={e => {
        if (e.detail === 2 && track?.id) onPlay(track.id)
      }}
    >
      {/* Cover */}
      <Image
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
        animation={false}
        placeholder={false}
      />

      {/* Track info */}
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium ',
            isPlaying
              ? 'text-brand-700'
              : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200  dark:text-neutral-700'>
          {track?.ar.map(a => a.name).join(', ')}
        </div>
      </div>
    </div>
  )
}

const Popular = ({ tracks }: { tracks?: Track[] }) => {
  const onPlay = (id: number) => {
    if (!tracks) return
    player.playAList(
      tracks.map(t => t.id),
      id
    )
  }

  return (
    <div>
      <div className='mb-4 text-12 font-medium uppercase text-neutral-300'>
        Popular
      </div>

      <div className='grid grid-cols-3 grid-rows-3 gap-4 overflow-hidden'>
        {tracks?.slice(0, 9)?.map(t => (
          <Track key={t.id} track={t} onPlay={onPlay} />
        ))}
      </div>
    </div>
  )
}

export default Popular
