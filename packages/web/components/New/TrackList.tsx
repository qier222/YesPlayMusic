import { formatDuration } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import { useMemo } from 'react'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import Wave from './Wave'
import Icon from '@/web/components/Icon'
import useIsMobile from '@/web/hooks/useIsMobile'

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
  const isMobile = useIsMobile()

  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (isMobile) {
      onPlay?.(trackID)
    } else {
      if (e.detail === 2) onPlay?.(trackID)
    }
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
          className='group relative flex items-center py-2 text-16 font-medium text-neutral-200 transition duration-300 ease-in-out'
        >
          {/* Track no */}
          <div className='mr-3 lg:mr-6'>
            {String(track.no).padStart(2, '0')}
          </div>

          {/* Track name */}
          <div className='flex flex-grow items-center'>
            {track.name}
            {playingTrack?.id === track.id && (
              <div className='ml-4'>
                <Wave playing={playing} />
              </div>
            )}
          </div>

          {/* Desktop context menu  */}
          <div className='mr-12 hidden opacity-0 transition-opacity group-hover:opacity-100 lg:flex'>
            <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white/80'>
              {/* <Icon name='play' className='h-7 w-7' /> */}
            </div>
            <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-night-900 text-white/80'>
              {/* <Icon name='play' className='h-7 w-7' /> */}
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-night-900 text-white/80'>
              {/* <Icon name='play' className='h-7 w-7' /> */}
            </div>
          </div>

          {/* Mobile menu */}
          <div className='lg:hidden'>
            <div className='h-10 w-10 rounded-full bg-night-900'></div>
          </div>

          {/* Track duration */}
          <div className='hidden text-right lg:block'>
            {formatDuration(track.dt, 'en', 'hh:mm:ss')}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrackList
