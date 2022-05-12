import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import SQLite3 from 'better-sqlite3'
import log from './log'
import { createFileIfNotExist } from './utils'
import pkg from '../../package.json'
import { compare, validate } from 'compare-versions'
import { dirname } from './utils'

export const enum Tables {
  Track = 'Track',
  Album = 'Album',
  Artist = 'Artist',
  Playlist = 'Playlist',
  ArtistAlbum = 'ArtistAlbum',
  Lyric = 'Lyric',
  Audio = 'Audio',
  AccountData = 'AccountData',
  CoverColor = 'CoverColor',
  AppData = 'AppData',
}
interface CommonTableStructure {
  id: number
  json: string
  updatedAt: number
}
export interface TablesStructures {
  [Tables.Track]: CommonTableStructure
  [Tables.Album]: CommonTableStructure
  [Tables.Artist]: CommonTableStructure
  [Tables.Playlist]: CommonTableStructure
  [Tables.ArtistAlbum]: CommonTableStructure
  [Tables.Lyric]: CommonTableStructure
  [Tables.AccountData]: {
    id: string
    json: string
    updatedAt: number
  }
  [Tables.Audio]: {
    id: number
    br: number
    type: 'mp3' | 'flac' | 'ogg' | 'wav' | 'm4a' | 'aac' | 'unknown' | 'opus'
    source:
      | 'unknown'
      | 'netease'
      | 'migu'
      | 'kuwo'
      | 'kugou'
      | 'youtube'
      | 'qq'
      | 'bilibili'
      | 'joox'
    updatedAt: number
  }
  [Tables.CoverColor]: {
    id: number
    color: string
  }
  [Tables.AppData]: {
    id: 'appVersion' | 'skippedVersion'
    value: string
  }
}

type TableNames = keyof TablesStructures

const readSqlFile = (filename: string) => {
  return fs.readFileSync(path.join(dirname, `./migrations/${filename}`), 'utf8')
}

class DB {
  sqlite: SQLite3.Database
  dbFilePath: string = path.resolve(
    app.getPath('userData'),
    './api_cache/db.sqlite'
  )

  constructor() {
    log.info('[db] Initializing database...')

    createFileIfNotExist(this.dbFilePath)

    this.sqlite = new SQLite3(this.dbFilePath, {
      nativeBinding: path.join(
        __dirname,
        `./binary/better_sqlite3_${process.arch}.node`
      ),
    })
    this.sqlite.pragma('auto_vacuum = FULL')
    this.initTables()
    this.migrate()

    log.info('[db] Database initialized')
  }

  initTables() {
    const init = readSqlFile('init.sql')
    this.sqlite.exec(init)
  }

  migrate() {
    const key = 'appVersion'
    const appVersion = this.find(Tables.AppData, key)
    const updateAppVersionInDB = () => {
      this.upsert(Tables.AppData, {
        id: key,
        value: pkg.version,
      })
    }

    if (!appVersion?.value) {
      updateAppVersionInDB()
      return
    }

    const sqlFiles = fs.readdirSync(path.join(dirname, './migrations'))
    sqlFiles.forEach((sqlFile: string) => {
      const version = sqlFile.split('.').shift() || ''
      if (!validate(version)) return
      if (compare(version, pkg.version, '>')) {
        const file = readSqlFile(sqlFile)
        this.sqlite.exec(file)
      }
    })

    updateAppVersionInDB()
  }

  find<T extends TableNames>(
    table: T,
    key: TablesStructures[T]['id']
  ): TablesStructures[T] | undefined {
    return this.sqlite
      .prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`)
      .get(key)
  }

  findMany<T extends TableNames>(
    table: T,
    keys: TablesStructures[T]['id'][]
  ): TablesStructures[T][] {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return this.sqlite.prepare(`SELECT * FROM ${table} WHERE ${idsQuery}`).all()
  }

  findAll<T extends TableNames>(table: T): TablesStructures[T][] {
    return this.sqlite.prepare(`SELECT * FROM ${table}`).all()
  }

  create<T extends TableNames>(
    table: T,
    data: TablesStructures[T],
    skipWhenExist: boolean = true
  ) {
    if (skipWhenExist && db.find(table, data.id)) return
    return this.sqlite.prepare(`INSERT INTO ${table} VALUES (?)`).run(data)
  }

  createMany<T extends TableNames>(
    table: T,
    data: TablesStructures[T][],
    skipWhenExist: boolean = true
  ) {
    const valuesQuery = Object.keys(data[0])
      .map(key => `:${key}`)
      .join(', ')
    const insert = this.sqlite.prepare(
      `INSERT ${
        skipWhenExist ? 'OR IGNORE' : ''
      } INTO ${table} VALUES (${valuesQuery})`
    )
    const insertMany = this.sqlite.transaction((rows: any[]) => {
      rows.forEach((row: any) => insert.run(row))
    })
    insertMany(data)
  }

  upsert<T extends TableNames>(table: T, data: TablesStructures[T]) {
    const valuesQuery = Object.keys(data)
      .map(key => `:${key}`)
      .join(', ')
    return this.sqlite
      .prepare(`INSERT OR REPLACE INTO ${table} VALUES (${valuesQuery})`)
      .run(data)
  }

  upsertMany<T extends TableNames>(table: T, data: TablesStructures[T][]) {
    const valuesQuery = Object.keys(data[0])
      .map(key => `:${key}`)
      .join(', ')
    const upsert = this.sqlite.prepare(
      `INSERT OR REPLACE INTO ${table} VALUES (${valuesQuery})`
    )
    const upsertMany = this.sqlite.transaction((rows: any[]) => {
      rows.forEach((row: any) => upsert.run(row))
    })
    upsertMany(data)
  }

  delete<T extends TableNames>(table: T, key: TablesStructures[T]['id']) {
    return this.sqlite.prepare(`DELETE FROM ${table} WHERE id = ?`).run(key)
  }

  deleteMany<T extends TableNames>(
    table: T,
    keys: TablesStructures[T]['id'][]
  ) {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return this.sqlite.prepare(`DELETE FROM ${table} WHERE ${idsQuery}`).run()
  }

  truncate<T extends TableNames>(table: T) {
    return this.sqlite.prepare(`DELETE FROM ${table}`).run()
  }

  vacuum() {
    return this.sqlite.prepare('VACUUM').run()
  }
}

export const db = new DB()
