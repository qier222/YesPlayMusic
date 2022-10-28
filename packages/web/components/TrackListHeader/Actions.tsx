import { openContextMenu } from '@/web/states/contextMenus'
import { cx } from '@emotion/css'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import Icon from '../Icon'

const Actions = ({
  onPlay,
  onLike,
  isLiked,
  isLoading,
}: {
  isLiked?: boolean
  isLoading?: boolean
  onPlay: () => void
  onLike?: () => void
}) => {
  const params = useParams()
  const { t } = useTranslation()

  return (
    <div className='mt-11 flex items-end justify-between lg:mt-4 lg:justify-start'>
      <div className='flex items-end'>
        {/* Menu */}
        <button
          onClick={event => {
            params?.id &&
              openContextMenu({
                event,
                type: 'album',
                dataSourceID: params.id,
              })
          }}
          className={cx(
            'mr-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition duration-400',
            isLoading
              ? 'text-transparent'
              : 'text-white/40 hover:text-white/70  hover:dark:bg-white/30'
          )}
        >
          <Icon name='more' className='pointer-events-none h-7 w-7' />
        </button>
        {/* Like */}
        {onLike && (
          <button
            onClick={() => onLike()}
            className={cx(
              'flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition duration-400  lg:mr-2.5',
              isLoading
                ? 'text-transparent'
                : 'text-white/40 hover:text-white/70  hover:dark:bg-white/30'
            )}
          >
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              className='h-7 w-7'
            />
          </button>
        )}
      </div>
      <button
        onClick={() => onPlay()}
        className={cx(
          'h-14 rounded-full px-10 text-18 font-medium',
          isLoading ? 'bg-white/10 text-transparent' : 'bg-brand-700 text-white'
        )}
      >
        {t`player.play`}
      </button>
    </div>
  )
}

export default Actions
