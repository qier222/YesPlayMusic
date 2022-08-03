import { css, cx } from '@emotion/css'
import Cover from './Cover'
import Actions from './Actions'
import Info from './Info'
import React from 'react'

interface Props {
  className?: string
  title?: string
  creatorName?: string
  creatorLink?: string
  description?: string
  extraInfo?: string | React.ReactNode
  cover?: string
  videoCover?: string
  isLiked: boolean
  onPlay: () => void
  onLike?: () => void
}

const TrackListHeader = ({
  className,
  title,
  creatorName,
  creatorLink,
  description,
  extraInfo,
  cover,
  videoCover,
  isLiked,
  onPlay,
  onLike,
}: Props) => {
  return (
    <div
      className={cx(
        className,
        'mx-2.5 rounded-48 p-8 dark:bg-white/10',
        'lg:mx-0 lg:grid lg:grid-rows-1 lg:gap-10 lg:rounded-none lg:p-0 lg:dark:bg-transparent',
        css`
          grid-template-columns: 318px auto;
        `
      )}
    >
      <Cover {...{ cover, videoCover }} />

      <div className='flex flex-col justify-between'>
        <Info
          {...{ title, creatorName, creatorLink, description, extraInfo }}
        />
        <Actions {...{ onPlay, onLike, isLiked }} />
      </div>
    </div>
  )
}

const memoized = React.memo(TrackListHeader)
memoized.displayName = 'TrackListHeader'

export default memoized
