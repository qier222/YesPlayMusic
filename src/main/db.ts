import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import SQLite3 from 'better-sqlite3'
import logger from './logger'
import { createFileIfNotExist } from './utils'

const isDev = process.env.NODE_ENV === 'development'

logger.info('[db] Initializing database...')

export enum Tables {
  TRACK = 'track',
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
  ARTIST_ALBUMS = 'artist_album',
  LYRIC = 'lyric',

  // Special tables
  ACCOUNT_DATA = 'account_data',
  AUDIO = 'audio',
}

const dbFilePath = path.resolve(
  app.getPath('userData'),
  './api_cache/db.sqlite'
)
createFileIfNotExist(dbFilePath)

const sqlite = new SQLite3(dbFilePath, {
  nativeBinding: path.join(__dirname, `./better_sqlite3_${process.arch}.node`),
})
sqlite.pragma('auto_vacuum = FULL')

// Init tables if not exist
const trackTable = sqlite
  .prepare("SELECT * FROM sqlite_master WHERE name='track' and type='table'")
  .get()
if (!trackTable) {
  const migration = fs.readFileSync(
    isDev
      ? path.join(process.cwd(), './src/main/migrations/init.sql')
      : path.join(__dirname, './migrations/init.sql'),
    'utf8'
  )
  sqlite.exec(migration)
}

export const db = {
  find: (table: Tables, key: number | string) => {
    return sqlite
      .prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`)
      .get(key)
  },
  findMany: (table: Tables, keys: number[] | string[]) => {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return sqlite.prepare(`SELECT * FROM ${table} WHERE ${idsQuery}`).all()
  },
  findAll: (table: Tables) => {
    return sqlite.prepare(`SELECT * FROM ${table}`).all()
  },
  create: (table: Tables, data: any, skipWhenExist: boolean = true) => {
    if (skipWhenExist && db.find(table, data.id)) return
    return sqlite.prepare(`INSERT INTO ${table} VALUES (?)`).run(data)
  },
  createMany: (table: Tables, data: any[], skipWhenExist: boolean = true) => {
    const valuesQuery = Object.keys(data[0])
      .map(key => `:${key}`)
      .join(', ')
    const insert = sqlite.prepare(
      `INSERT ${
        skipWhenExist ? 'OR IGNORE' : ''
      } INTO ${table} VALUES (${valuesQuery})`
    )
    const insertMany = sqlite.transaction((rows: any[]) => {
      rows.forEach((row: any) => insert.run(row))
    })
    insertMany(data)
  },
  upsert: (table: Tables, data: any) => {
    const valuesQuery = Object.keys(data)
      .map(key => `:${key}`)
      .join(', ')
    return sqlite
      .prepare(`INSERT OR REPLACE INTO ${table} VALUES (${valuesQuery})`)
      .run(data)
  },
  upsertMany: (table: Tables, data: any[]) => {
    const valuesQuery = Object.keys(data[0])
      .map(key => `:${key}`)
      .join(', ')
    const upsert = sqlite.prepare(
      `INSERT OR REPLACE INTO ${table} VALUES (${valuesQuery})`
    )
    const upsertMany = sqlite.transaction((rows: any[]) => {
      rows.forEach((row: any) => upsert.run(row))
    })
    upsertMany(data)
  },
  delete: (table: Tables, key: number | string) => {
    return sqlite.prepare(`DELETE FROM ${table} WHERE id = ?`).run(key)
  },
  deleteMany: (table: Tables, keys: number[] | string[]) => {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return sqlite.prepare(`DELETE FROM ${table} WHERE ${idsQuery}`).run()
  },
  truncate: (table: Tables) => {
    return sqlite.prepare(`DELETE FROM ${table}`).run()
  },
  vacuum: () => {
    return sqlite.prepare('VACUUM').run()
  },
}

logger.info('[db] Database initialized')
