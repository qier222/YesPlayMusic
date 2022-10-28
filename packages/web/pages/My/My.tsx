import { css, cx } from '@emotion/css'
import PlayLikedSongsCard from './PlayLikedSongsCard'
import PageTransition from '@/web/components/PageTransition'
import RecentlyListened from './RecentlyListened'
import Collections from './Collections'

const My = () => {
  return (
    <PageTransition>
      <div className='grid grid-cols-1 gap-10'>
        <PlayLikedSongsCard />
        <RecentlyListened />
        <Collections />
      </div>
    </PageTransition>
  )
}

export default My
