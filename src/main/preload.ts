import log from './log'
import path from 'path'
import { app } from 'electron'
import { createDirIfNotExist } from './utils'

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  const devUserDataPath = path.resolve(process.cwd(), './tmp/userData')
  createDirIfNotExist(devUserDataPath)
  app.setPath('appData', devUserDataPath)
}
log.info(`[index] userData path: ${app.getPath('userData')}`)
