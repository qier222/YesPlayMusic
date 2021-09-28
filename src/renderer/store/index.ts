import { createPinia, defineStore } from 'pinia'
import state from './state'
import getters from './getters'
import actions from './actions'
import persistState from './plugins/persistState'

const store = createPinia()
store.use(persistState)

export const useStore = defineStore('store', {
  state,
  getters,
  actions,
})

export default store
