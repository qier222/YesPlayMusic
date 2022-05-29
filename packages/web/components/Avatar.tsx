import { resizeImage } from '../utils/common'
import useUser from '@/web/api/hooks/useUser'
import Icon from './Icon'
import { cx } from '@emotion/css'
import { useNavigate } from 'react-router-dom'

const Avatar = ({ size }: { size?: string }) => {
  const navigate = useNavigate()
  const { data: user } = useUser()

  const avatarUrl = user?.profile?.avatarUrl
    ? resizeImage(user?.profile?.avatarUrl ?? '', 'sm')
    : ''

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          onClick={() => navigate('/login')}
          className={cx(
            'app-region-no-drag rounded-full bg-gray-100 dark:bg-gray-700',
            size || 'h-9 w-9'
          )}
        />
      ) : (
        <div onClick={() => navigate('/login')}>
          <Icon
            name='user'
            className={cx(
              'rounded-full bg-black/[.06] p-1 text-gray-500 dark:bg-white/5',
              size || 'h-9 w-9'
            )}
          />
        </div>
      )}
    </>
  )
}

export default Avatar
