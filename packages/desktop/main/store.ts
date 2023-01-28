import Store from 'electron-store'

export interface TypedElectronStore {
  window: {
    width: number
    height: number
    x?: number
    y?: number
  }
  // settings: State['settings']
}

const store = new Store<TypedElectronStore>({
  defaults: {
    window: {
      width: 1440,
      height: 1024,
    },
    // settings: initialState.settings,
  },
})

export default store
