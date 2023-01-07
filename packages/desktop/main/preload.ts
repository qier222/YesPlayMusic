import log from './log'
import { app } from 'electron'
import { isDev } from './env'
import {
  createDirIfNotExist,
  portableUserDataPath,
  devUserDataPath,
} from './utils'

if (isDev) {
  createDirIfNotExist(devUserDataPath)
  app.setPath('appData', devUserDataPath)
}
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  createDirIfNotExist(portableUserDataPath)
  app.setPath('appData', portableUserDataPath)
}

log.info(`[preload] userData path: ${app.getPath('userData')}`)
