import PlayLikedSongsCard from './PlayLikedSongsCard'
import PageTransition from '@/web/components/PageTransition'
import RecentlyListened from './RecentlyListened'
import Collections from './Collections'
import { useIsLoggedIn } from '@/web/api/hooks/useUser'

function PleaseLogin() {
  return <></>
}

const My = () => {
  const isLoggedIn = useIsLoggedIn()
  return (
    <PageTransition>
      {isLoggedIn ? (
        <div className='grid grid-cols-1 gap-10'>
          <PlayLikedSongsCard />
          <RecentlyListened />
          <Collections />
        </div>
      ) : (
        <PleaseLogin />
      )}
    </PageTransition>
  )
}

export default My
