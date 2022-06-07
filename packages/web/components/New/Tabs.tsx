import { cx } from '@emotion/css'

const Tabs = ({
  tabs,
  value,
  onChange,
}: {
  tabs: {
    id: string
    name: string
  }[]
  value: string
  onChange: (id: string) => void
}) => {
  return (
    <div className='no-scrollbar flex overflow-y-auto'>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={cx(
            'mr-2.5 rounded-12 py-3 px-6 text-16 font-medium ',
            value === tab.id
              ? 'bg-brand-700 text-white'
              : 'dark:bg-white/10 dark:text-white/20'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  )
}

export default Tabs
