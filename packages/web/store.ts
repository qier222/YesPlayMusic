import { proxy, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'
import { Player } from '@/web/utils/player'
import { merge } from 'lodash-es'
import { IpcChannels } from '@/shared/IpcChannels'
import { Store, initialState } from '@/shared/store'

const stateInLocalStorage = localStorage.getItem('state')
export const state = proxy<Store>(
  merge(initialState, [
    stateInLocalStorage ? JSON.parse(stateInLocalStorage) : {},
    {
      uiStates: {
        showLyricPanel: false,
      },
    },
  ])
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
  ;(window as any).player = player
}

// Devtools
devtools(state, 'state')
devtools(player, 'player')
