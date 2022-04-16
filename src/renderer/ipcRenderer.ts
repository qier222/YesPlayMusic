import { player } from '@/renderer/store'
import { IpcChannels } from '@/main/IpcChannelsName'

export function ipcRenderer() {
  window.ipcRenderer?.on(IpcChannels.Play, () => {
    player.play()
  })

  window.ipcRenderer?.on(IpcChannels.Pause, () => {
    player.pause()
  })

  window.ipcRenderer?.on(IpcChannels.PlayOrPause, () => {
    player.playOrPause()
  })

  window.ipcRenderer?.on(IpcChannels.Next, () => {
    player.nextTrack()
  })

  window.ipcRenderer?.on(IpcChannels.Previous, () => {
    player.prevTrack()
  })

  window.ipcRenderer?.on(IpcChannels.Repeat, (e, mode) => {
    player.repeatMode = mode
  })
}
