import { player } from '@/store'
import SvgIcon from './SvgIcon'

const Controls = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.rendererEvents?.onMaximizeStateChanged(value => {
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

const Title = ({ className }: { className?: string }) => {
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  return (
    <div className={classNames('text-sm text-gray-500', className)}>
      {track?.name && (
        <>
          <span>{track.name}</span>
          <span className='mx-2'>-</span>
        </>
      )}
      <span>YesPlayMusic</span>
    </div>
  )
}

const Win = () => {
  return (
    <div className='flex h-8 w-screen items-center justify-between bg-gray-50'>
      <Title className='ml-3' />
      <Controls />
    </div>
  )
}

const Linux = () => {
  return (
    <div className='flex h-8 w-screen items-center justify-between bg-gray-50'>
      <div></div>
      <Title className='text-center' />
      <Controls />
    </div>
  )
}

const TitleBar = () => {
  return (
    <div className='app-region-drag fixed z-30'>
      {window.env?.isWin ? <Win /> : <Linux />}
    </div>
  )
}

export default TitleBar
