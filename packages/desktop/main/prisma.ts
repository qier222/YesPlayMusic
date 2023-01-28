import { app } from 'electron'
import path from 'path'
import { PrismaClient } from '../prisma/client'
import { isDev } from './env'
import log from './log'
import { createFileIfNotExist, dirname, isFileExist } from './utils'
import fs from 'fs'

export const dbPath = path.join(app.getPath('userData'), 'r3play.db')
export const dbUrl = 'file://' + dbPath

const extraResourcesPath = app.getAppPath().replace('app.asar', '') // impacted by extraResources setting in electron-builder.yml
function getPlatformName(): string {
  const isDarwin = process.platform === 'darwin'
  if (isDarwin && process.arch === 'arm64') {
    return process.platform + 'Arm64'
  }

  return process.platform
}
const platformName = getPlatformName()
export const platformToExecutables: any = {
  win32: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  },
  linux: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node',
  },
  darwin: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node',
  },
  darwinArm64: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin-arm64',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  },
}
export const queryEnginePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].queryEngine
)

log.info('[prisma] dbUrl', dbUrl)

// Hacky, but putting this here because otherwise at query time the Prisma client
// gives an error "Environment variable not found: DATABASE_URL" despite us passing
// the dbUrl into the prisma client constructor in datasources.db.url
process.env.DATABASE_URL = dbUrl

const isInitialized = isFileExist(dbPath)
if (!isInitialized) {
  const from = isDev ? path.join(dirname, './prisma/r3play.db') : path.join(dirname, './r3play.db')
  log.info(`[prisma] copy r3play.db file from ${from} to ${dbPath}`)
  fs.copyFileSync(from, dbPath)
  log.info('[prisma] Database tables initialized.')
} else {
  log.info('[prisma] Database tables already initialized before.')
}

let prisma: PrismaClient = null
try {
  prisma = new PrismaClient({
    log: isDev ? ['info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    // see https://github.com/prisma/prisma/discussions/5200
    // @ts-expect-error internal prop
    //   __internal: {
    //     engine: {
    //       binaryPath: queryEnginePath,
    //     },
    //   },
  })
  log.info('[prisma] prisma initialized')
} catch (e) {
  log.error('[prisma] failed to init prisma', e)
}

export default prisma
