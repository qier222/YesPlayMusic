import { useState } from 'react'
import { IpcChannels } from '@/shared/IpcChannels'
import useIpcRenderer from '@/web/hooks/useIpcRenderer'

const TrafficLight = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useIpcRenderer(IpcChannels.IsMaximized, (e, value) => {
    setIsMaximized(value)
  })

  if (isMaximized) {
    return <></>
  }

  const className =
    'mr-2 h-3 w-3 rounded-full last-of-type:mr-0 dark:bg-white/20'
  return (
    <div className='flex'>
      <div className={className}></div>
      <div className={className}></div>
      <div className={className}></div>
    </div>
  )
}

export default TrafficLight
