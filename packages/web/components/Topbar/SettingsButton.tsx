import Icon from '@/web/components/Icon'
import { cx } from '@emotion/css'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SettingsButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/settings')}
      className={cx(
        'app-region-no-drag flex h-12 w-12 items-center justify-center rounded-full bg-day-600 text-neutral-500 transition duration-400 dark:bg-white/10 dark:hover:bg-white/20 dark:hover:text-neutral-300',
        className
      )}
    >
      <Icon name='settings' className='h-5 w-5 ' />
    </button>
  )
}

export default SettingsButton
