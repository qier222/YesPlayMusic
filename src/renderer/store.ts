import { proxy, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'
import { Player } from '@/renderer/utils/player'
import {merge} from 'lodash-es'

interface Store {
  uiStates: {
    loginPhoneCountryCode: string
    showLyricPanel: boolean
  }
  settings: {
    showSidebar: boolean
    accentColor: string
  }
}

const initialState: Store = {
  uiStates: {
    loginPhoneCountryCode: '+86',
    showLyricPanel: false,
  },
  settings: {
    showSidebar: true,
    accentColor: 'blue',
  },
}

const stateInLocalStorage = localStorage.getItem('state')
export const state = proxy<Store>(
  merge(initialState, stateInLocalStorage ? JSON.parse(stateInLocalStorage) : {})
)
subscribe(state, () => {
  localStorage.setItem('state', JSON.stringify(state))
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
