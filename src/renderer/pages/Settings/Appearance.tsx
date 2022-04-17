import { state } from '@/renderer/store'
import { changeAccentColor } from '@/renderer/utils/theme'

const AccentColor = () => {
  const colors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    sky: 'bg-sky-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    fuchsia: 'bg-fuchsia-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
  }

  const changeColor = (color: string) => {
    state.settings.accentColor = color
    changeAccentColor(color)
  }
  return (
    <div className='mt-4 flex'>
      {Object.entries(colors).map(([color, bg]) => (
        <div
          key={color}
          className={classNames(bg, 'mr-3 h-6 w-6 rounded-full')}
          onClick={() => changeColor(color)}
        ></div>
      ))}
    </div>
  )
}

const Appearance = () => {
  return (
    <div>
      <div className='text-xl dark:text-white/70'>主题</div>
      <div className='mt-3 h-px w-full bg-white/10'></div>

      <AccentColor />
    </div>
  )
}

export default Appearance
