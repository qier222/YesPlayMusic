import useUserArtists, { useMutationLikeAArtist } from '@/web/api/hooks/useUserArtists'
import Icon from '@/web/components/Icon'
import { openContextMenu } from '@/web/states/contextMenus'
import player from '@/web/states/player'
import { cx } from '@emotion/css'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

const Actions = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslation()

  const { data: likedArtists } = useUserArtists()
  const params = useParams()
  const id = Number(params.id) || 0
  const isLiked = !!likedArtists?.data?.find(artist => artist.id === id)
  const likeArtist = useMutationLikeAArtist()

  return (
    <div className='mt-11 flex items-end justify-between lg:z-10 lg:mt-6'>
      <div className='flex items-end'>
        {/* Menu */}
        <button
          onClick={event => {
            openContextMenu({
              event,
              type: 'artist',
              dataSourceID: id,
            })
          }}
          className={cx(
            'mr-2.5 flex h-14 w-14 items-center justify-center rounded-full transition duration-400 dark:bg-white/10 ',
            isLoading
              ? 'text-transparent'
              : 'text-white/40 hover:text-white/70  hover:dark:bg-white/30 '
          )}
        >
          <Icon name='more' className='pointer-events-none h-7 w-7' />
        </button>

        {/* Like */}
        <button
          onClick={() => likeArtist.mutateAsync(id)}
          className={cx(
            'mr-2.5 flex h-14 w-14 items-center justify-center rounded-full transition duration-400 dark:bg-white/10 ',
            isLoading
              ? 'text-transparent'
              : 'text-white/40 hover:text-white/70  hover:dark:bg-white/30 '
          )}
        >
          <Icon name={isLiked ? 'heart' : 'heart-outline'} className='h-7 w-7' />
        </button>
      </div>

      {/* Listen */}
      <button
        onClick={() => player.playArtistPopularTracks(id)}
        className={cx(
          'h-14 rounded-full px-10 text-18 font-medium',
          isLoading ? 'bg-white/10 text-transparent' : 'bg-brand-700 text-white'
        )}
      >
        {t`artist.listen`}
      </button>
    </div>
  )
}

export default Actions
