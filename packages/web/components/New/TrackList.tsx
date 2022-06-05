import { formatDuration } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import Wave from './Wave'

const TrackList = ({
  tracks,
  onPlay,
  className,
}: {
  tracks?: Track[]
  onPlay: (id: number) => void
  className?: string
}) => {
  const playerSnapshot = useSnapshot(player)
  const playingTrack = useMemo(
    () => playerSnapshot.track,
    [playerSnapshot.track]
  )

  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (e.detail === 2) onPlay?.(trackID)
  }

  const playing = useMemo(
    () => playerSnapshot.state === 'playing',
    [playerSnapshot.state]
  )

  return (
    <div className={className}>
      {tracks?.map(track => (
        <div
          key={track.id}
          onClick={e => handleClick(e, track.id)}
          className='relative flex items-center py-2 text-18 font-medium text-night-50 transition duration-300 ease-in-out dark:hover:text-neutral-200'
        >
          <div className='mr-6'>{String(track.no).padStart(2, '0')}</div>
          <div className='flex-grow'>{track.name}</div>
          <div className='h-10 w-10'></div>
          <div className='text-right'>
            {formatDuration(track.dt, 'en', 'hh:mm:ss')}
          </div>

          {/* The wave icon */}
          {playingTrack?.id === track.id && playing && (
            <div className='absolute -left-7'>
              <Wave playing={playing} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TrackList
