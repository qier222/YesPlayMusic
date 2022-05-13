import log from './log'
import { app } from 'electron'
import {
  createDirIfNotExist,
  devUserDataPath,
  isDev,
  portableUserDataPath,
} from './utils'

if (isDev) {
  createDirIfNotExist(devUserDataPath)
  app.setPath('appData', devUserDataPath)
}
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  createDirIfNotExist(portableUserDataPath)
  app.setPath('appData', portableUserDataPath)
}

log.info(`[index] userData path: ${app.getPath('userData')}`)
