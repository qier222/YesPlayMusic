import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'

interface PersistedUiStates {
  loginPhoneCountryCode: string
  loginType: 'phone' | 'email' | 'qrCode'
  minimizePlayer: boolean
}

const initPersistedUiStates: PersistedUiStates = {
  loginPhoneCountryCode: '+86',
  loginType: 'qrCode',
  minimizePlayer: false,
}

const STORAGE_KEY = 'persistedUiStates'
const statesInStorage = localStorage.getItem(STORAGE_KEY)
let sates = {}
if (statesInStorage) {
  try {
    sates = JSON.parse(statesInStorage)
  } catch {
    // ignore
  }
}

const persistedUiStates = proxy<PersistedUiStates>(
  merge(initPersistedUiStates, sates)
)

subscribe(persistedUiStates, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedUiStates))
})

export default persistedUiStates
