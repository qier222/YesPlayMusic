import { proxy, subscribe } from 'valtio'

interface PersistedUiStates {
  loginPhoneCountryCode: string
  loginType: 'phone' | 'email' | 'qrCode'
}

const initPersistedUiStates: PersistedUiStates = {
  loginPhoneCountryCode: '+86',
  loginType: 'qrCode',
}

const persistedUiStates = proxy<PersistedUiStates>(initPersistedUiStates)

subscribe(persistedUiStates, () => {
  localStorage.setItem('persistedUiStates', JSON.stringify(persistedUiStates))
})

export default persistedUiStates
