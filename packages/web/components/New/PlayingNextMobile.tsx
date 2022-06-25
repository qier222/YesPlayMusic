import { useLockBodyScroll } from 'react-use'
import PlayingNext from './PlayingNext'

const PlayingNextMobile = () => {
  useLockBodyScroll(true)

  return (
    <div className='fixed inset-0 z-10 bg-black/80 backdrop-blur-3xl'>
      <div className='px-7'>
        <PlayingNext />
      </div>
    </div>
  )
}

export default PlayingNextMobile
