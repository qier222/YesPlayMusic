import { proxy, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'
import { Player } from '@/utils/player'

interface Store {
  uiStates: {
    loginPhoneCountryCode: string
  }
  settings: {
    showSidebar: boolean
  }
}

const initialState: Store = {
  uiStates: {
    loginPhoneCountryCode: '+86',
  },
  settings: {
    showSidebar: true,
  },
}

const stateInLocalStorage = localStorage.getItem('state')
export const state = proxy<Store>(
  (stateInLocalStorage && JSON.parse(stateInLocalStorage)) || initialState
)
subscribe(state, () => {
  localStorage.setItem('state', JSON.stringify(state))
})

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
