import player from '@/web/states/player'
import { css, cx } from '@emotion/css'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSnapshot } from 'valtio'

const useAirplayDevices = () => {
  return useQuery(['useAirplayDevices'], () =>
    window.ipcRenderer?.invoke('airplay-scan-devices')
  )
}

const Airplay = () => {
  const [showPanel, setShowPanel] = useState(false)
  const { data: devices, isLoading } = useAirplayDevices()
  const { remoteDevice } = useSnapshot(player)
  const selectedAirplayDeviceID =
    remoteDevice?.protocol === 'airplay' ? remoteDevice?.id : ''

  return (
    <div
      className={cx(
        'fixed z-20',
        css`
          top: 46px;
          right: 256px;
        `
      )}
    >
      <div
        onClick={() => setShowPanel(!showPanel)}
        className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-24 text-white'
      >
        A
      </div>

      {showPanel && (
        <div
          className={cx(
            'absolute  rounded-24 border border-white/10 bg-black/60 p-2 backdrop-blur-xl',
            css`
              width: 256px;
              height: 256px;
            `
          )}
        >
          {devices?.devices?.map(device => (
            <div
              key={device.identifier}
              className={cx(
                'rounded-12 p-2 hover:bg-white/10',
                device.identifier === selectedAirplayDeviceID
                  ? 'text-brand-500'
                  : 'text-white'
              )}
              onClick={() => player.switchToAirplayDevice(device.identifier)}
            >
              {device.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Airplay
