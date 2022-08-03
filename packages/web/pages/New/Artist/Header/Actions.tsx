import useUserArtists, {
  useMutationLikeAArtist,
} from '@/web/api/hooks/useUserArtists'
import Icon from '@/web/components/Icon'
import player from '@/web/states/player'
import { useParams } from 'react-router-dom'

const Actions = () => {
  const { data: likedArtists } = useUserArtists()
  const params = useParams()
  const id = Number(params.id) || 0
  const isLiked = !!likedArtists?.data?.find(artist => artist.id === id)
  const likeArtist = useMutationLikeAArtist()

  return (
    <div className='mt-11 flex items-end justify-between lg:z-10 lg:mt-6'>
      <div className='flex items-end'>
        {/* Menu */}
        <button className='mr-2.5 flex h-14 w-14 items-center justify-center rounded-full text-white/40 transition duration-400 hover:text-white/70 dark:bg-white/10 hover:dark:bg-white/30'>
          <Icon name='more' className='h-7 w-7' />
        </button>

        {/* Like */}
        <button
          onClick={() => likeArtist.mutateAsync(id)}
          className='flex h-14 w-14 items-center justify-center rounded-full text-white/40 transition duration-400 hover:text-white/70 dark:bg-white/10 hover:dark:bg-white/30'
        >
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            className='h-7 w-7'
          />
        </button>
      </div>

      {/* Listen */}
      <button
        onClick={() => player.playArtistPopularTracks(id)}
        className='h-14 rounded-full px-10 text-18 font-medium text-white dark:bg-brand-700'
      >
        Listen
      </button>
    </div>
  )
}

export default Actions
