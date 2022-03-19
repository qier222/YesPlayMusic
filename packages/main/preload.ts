import logger from './logger'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

const isDev = !app.isPackaged

if (isDev) {
  const devUserDataPath = path.resolve(process.cwd(), './tmp/userData')
  try {
    fs.statSync(devUserDataPath)
  } catch (e) {
    fs.mkdirSync(devUserDataPath)
  }
  app.setPath('appData', devUserDataPath)
}
logger.info(`[index] userData path: ${app.getPath('userData')}`)
