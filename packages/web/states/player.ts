import { Player } from '@/web/utils/player'
import { proxy, subscribe } from 'valtio'

const playerInLocalStorage = localStorage.getItem('player')
const player = proxy(new Player())

player.init((playerInLocalStorage && JSON.parse(playerInLocalStorage)) || {})

subscribe(player, () => {
  localStorage.setItem('player', JSON.stringify(player))
})

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(window as any).player = player
}

export default player
