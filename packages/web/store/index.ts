import { proxy, subscribe } from 'valtio'
import { Player } from '@/web/utils/player'
import { merge } from 'lodash-es'
import { IpcChannels } from '@/shared/IpcChannels'
import { Store, initialState } from '@/shared/store'

const stateInLocalStorage = localStorage.getItem('state')
export const state = proxy<Store>(
  merge(
    initialState,
    stateInLocalStorage ? JSON.parse(stateInLocalStorage) : {},
    {
      uiStates: initialState.uiStates,
    }
  )
)
subscribe(state, () => {
  localStorage.setItem('state', JSON.stringify(state))
})
subscribe(state.settings, () => {
  window.ipcRenderer?.send(IpcChannels.SyncSettings, { ...state.settings })
})

// player
const playerInLocalStorage = localStorage.getItem('player')
export const player = proxy(new Player())
player.init((playerInLocalStorage && JSON.parse(playerInLocalStorage)) || {})
subscribe(player, () => {
  localStorage.setItem('player', JSON.stringify(player))
})

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(window as any).player = player
}
