import { useSnapshot } from 'valtio'
import settings from '../states/settings'

function useSettings() {
  const settingsState = useSnapshot(settings)
  return settingsState
}

export default useSettings
