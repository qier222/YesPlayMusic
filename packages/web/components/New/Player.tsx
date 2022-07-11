import { css, cx } from '@emotion/css'
import NowPlaying from './NowPlaying'
import PlayingNext from './PlayingNext'

const Player = () => {
  return (
    <div
      className={cx(
        'relative flex w-full flex-col justify-between overflow-hidden pr-6 pl-4',
        css`
          grid-area: player;
        `
      )}
    >
      <PlayingNext className='h-full' />
      <div className='pb-6'>
        <NowPlaying />
      </div>
    </div>
  )
}

export default Player
