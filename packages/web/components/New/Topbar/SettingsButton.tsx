import Icon from '@/web/components/Icon'
import { cx } from '@emotion/css'

const SettingsButton = ({ className }: { className?: string }) => {
  return (
    <button
      className={cx(
        'app-region-no-drag rounded-full bg-day-600 p-2.5 dark:bg-night-600',
        className
      )}
    >
      <Icon name='placeholder' className='h-7 w-7 text-neutral-500' />
    </button>
  )
}

export default SettingsButton
