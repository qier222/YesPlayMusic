import Icon from '@/web/components/Icon'
import Wave from '@/web/components/Wave'
import { openContextMenu } from '@/web/states/contextMenus'
import player from '@/web/states/player'
import { formatDuration, resizeImage } from '@/web/utils/common'
import { State as PlayerState } from '@/web/utils/player'
import { css, cx } from '@emotion/css'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { useSnapshot } from 'valtio'

const Track = ({
  track,
  index,
  playingTrackID,
  state,
  handleClick,
}: {
  track?: Track
  index: number
  playingTrackID: number
  state: PlayerState
  handleClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
}) => {
  return (
    <div
      className={cx(
        'mb-5 grid',
        css`
          grid-template-columns: 3fr 2fr 1fr;
        `
      )}
      onClick={e => track && handleClick(e, track.id)}
      onContextMenu={e => track && handleClick(e, track.id)}
    >
      {/* Right part */}
      <div className='flex items-center'>
        {/* Cover */}
        <img
          alt='Cover'
          className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
          src={resizeImage(track?.al?.picUrl || '', 'sm')}
        />

        {/* Track Name and Artists */}
        <div className='mr-3'>
          <div
            className={cx(
              'line-clamp-1 flex items-center text-16 font-medium',
              playingTrackID === track?.id
                ? 'text-brand-700'
                : 'text-neutral-700 dark:text-neutral-200'
            )}
          >
            {track?.name}

            {[1318912, 1310848].includes(track?.mark || 0) && (
              <Icon name='explicit' className='ml-2 mr-4 mt-px h-3.5 w-3.5 text-white/20' />
            )}
          </div>
          <div className='mt-1 line-clamp-1 text-14 font-bold text-white/30'>
            {track?.ar.map((a, index) => (
              <Fragment key={a.id}>
                {index > 0 && ', '}
                <NavLink
                  className='transition-all duration-300 hover:text-white/70'
                  to={`/artist/${a.id}`}
                >
                  {a.name}
                </NavLink>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Wave icon */}
        {playingTrackID === track?.id && (
          <div className='ml-5'>
            <Wave playing={state === 'playing'} />
          </div>
        )}
      </div>

      {/* Album Name */}
      <div className='flex items-center'>
        <NavLink
          to={`/album/${track?.al.id}`}
          className='line-clamp-1 text-14 font-bold text-white/40 transition-colors duration-300 hover:text-white/70'
        >
          {track?.al?.name}
        </NavLink>
      </div>

      {/* Duration */}
      <div className='line-clamp-1 flex items-center justify-end text-14 font-bold text-white/40'>
        {formatDuration(track?.dt || 0, 'en-US', 'hh:mm:ss')}
      </div>
    </div>
  )
}

function TrackList({
  tracks,
  onPlay,
  className,
  isLoading,
  placeholderRows = 12,
}: {
  tracks?: Track[]
  onPlay: (id: number) => void
  className?: string
  isLoading?: boolean
  placeholderRows?: number
}) {
  const { trackID, state } = useSnapshot(player)
  const playingTrack = tracks?.find(track => track.id === trackID)

  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (isLoading) return
    if (e.type === 'contextmenu') {
      e.preventDefault()
      openContextMenu({
        event: e,
        type: 'track',
        dataSourceID: trackID,
        options: {
          useCursorPosition: true,
        },
      })
      return
    }

    if (e.detail === 2) onPlay?.(trackID)
  }

  return (
    <div className={className}>
      {tracks?.map((track, index) => (
        <Track
          key={track.id}
          track={track}
          index={index}
          playingTrackID={playingTrack?.id || 0}
          state={state}
          handleClick={handleClick}
        />
      ))}
    </div>
  )
}

export default TrackList
