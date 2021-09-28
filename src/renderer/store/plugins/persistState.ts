import { PiniaPluginContext } from 'pinia'

export interface PersistStrategy {
  key: string
  storage: Storage
  paths?: string[]
}

const strategies: PersistStrategy[] = [
  {
    key: 'pinia',
    storage: localStorage,
  },
]

type Store = PiniaPluginContext['store']
type PartialState = Partial<Store['$state']>

const updateStorage = (strategy: PersistStrategy, store: Store) => {
  const storage = strategy.storage
  const storeKey = strategy.key

  if (strategy.paths) {
    const partialState = strategy.paths.reduce((finalObj, key) => {
      finalObj[key] = store.$state[key]
      return finalObj
    }, {} as PartialState)

    storage.setItem(storeKey, JSON.stringify(partialState))
  } else {
    storage.setItem(storeKey, JSON.stringify(store.$state))
  }
}

export default ({ options, store }: PiniaPluginContext): void => {
  strategies.forEach(strategy => {
    const storage = strategy.storage
    const storeKey = strategy.key
    const storageResult = storage.getItem(storeKey)

    if (storageResult) {
      store.$patch(JSON.parse(storageResult))
      updateStorage(strategy, store)
    }
  })

  store.$subscribe(() => {
    strategies.forEach(strategy => {
      updateStorage(strategy, store)
    })
  })
}
