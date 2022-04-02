import { RefObject } from 'react'
import { proxy, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'
import { player as PlayerCore } from '@/utils/player'

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

export const player = proxy(PlayerCore)
player.init()

if (import.meta.env.DEV) {
  window.player = player
}

// Devtools
devtools(state, 'state')
devtools(player, 'player')
