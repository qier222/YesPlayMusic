import Icon from '@/web/components/Icon'

const SettingsButton = () => {
  return (
    <button className='app-region-no-drag rounded-full bg-day-600 p-2.5 dark:bg-night-600'>
      <Icon name='placeholder' className='h-7 w-7 text-neutral-500' />
    </button>
  )
}

export default SettingsButton
