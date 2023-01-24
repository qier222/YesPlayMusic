import { cx } from '@emotion/css'

const Tabs = ({
  tabs,
  value,
  onChange,
  className,
  style,
}: {
  tabs: {
    id: string
    name: string
  }[]
  value: string
  onChange: (id: string) => void
  className?: string
  style?: React.CSSProperties
}) => {
  return (
    <div className={cx('no-scrollbar flex overflow-y-auto', className)} style={style}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={cx(
            'mr-2.5 rounded-12 py-3 px-6 text-16 font-medium backdrop-blur transition duration-500',
            value === tab.id
              ? 'bg-brand-700 text-white'
              : 'dark:bg-white/10 dark:text-white/20 hover:dark:bg-white/20 hover:dark:text-white/40'
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
