import { player } from '@/store'
import SvgIcon from './SvgIcon'

const Buttons = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.onApi?.maximizedStateChanged(value => {
      setIsMaximized(value)
    })
  }, [])

  const minimize = () => {
    window.ipcRenderer?.send('minimize')
  }

  const maxRestore = () => {
    window.ipcRenderer?.send('maximize-or-unmaximize')
  }

  const close = () => {
    window.ipcRenderer?.send('close')
  }

  return (
    <div className='app-region-no-drag flex h-full'>
      <button
        onClick={minimize}
        className='flex w-[2.875rem] items-center justify-center hover:bg-[#e9e9e9]'
      >
        <SvgIcon className='h-3 w-3' name='windows-minimize' />
      </button>
      <button
        onClick={maxRestore}
        className='flex w-[2.875rem] items-center justify-center hover:bg-[#e9e9e9]'
      >
        <SvgIcon
          className='h-3 w-3'
          name={isMaximized ? 'windows-un-maximize' : 'windows-maximize'}
        />
      </button>
      <button
        onClick={close}
        className='flex w-[2.875rem] items-center justify-center hover:bg-[#c42b1c] hover:text-white'
      >
        <SvgIcon className='h-3 w-3' name='windows-close' />
      </button>
    </div>
  )
}

const Win = ({ title }: { title: string }) => {
  return (
    <div className='flex h-8 w-screen items-center justify-between bg-gray-50'>
      <div className='ml-3 text-sm text-gray-500'>{title}</div>
      <Buttons />
    </div>
  )
}

const Linux = ({ title }: { title: string }) => {
  return (
    <div className='flex h-8 w-screen items-center justify-between bg-gray-50'>
      <div className='w-8'></div>
      <div className='text-center text-sm text-gray-500'>{title}</div>
      <Buttons />
    </div>
  )
}

const TitleBar = () => {
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  const title = () => {
    return track ? `${track.name} - YesPlayMusic` : 'YesPlayMusic'
  }

  return (
    <div className='app-region-drag fixed z-30'>
      {window.env?.isWin ? (
        <Win title={title()} />
      ) : (
        <Linux title={title()} />
      )}
    </div>
  )
}

export default TitleBar
