import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import SQLite3 from 'better-sqlite3'
import log from './log'
import { createFileIfNotExist } from './utils'

const isDev = process.env.NODE_ENV === 'development'

export enum Tables {
  Track = 'track',
  Album = 'album',
  Artist = 'artist',
  Playlist = 'playlist',
  ArtistAlbum = 'artist_album',
  Lyric = 'lyric',

  // Special tables
  AccountData = 'account_data',
  Audio = 'audio',
  CoverColor = 'cover_color',
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
        `./better_sqlite3_${process.arch}.node`
      ),
    })
    this.sqlite.pragma('auto_vacuum = FULL')
    this.initTables()

    log.info('[db] Database initialized')
  }

  initTables() {
    const migration = fs.readFileSync(
      isDev
        ? path.join(process.cwd(), './src/main/migrations/init.sql')
        : path.join(__dirname, './migrations/init.sql'),
      'utf8'
    )
    this.sqlite.exec(migration)
  }

  find(table: Tables, key: number | string) {
    return this.sqlite
      .prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`)
      .get(key)
  }

  findMany(table: Tables, keys: number[] | string[]) {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return this.sqlite.prepare(`SELECT * FROM ${table} WHERE ${idsQuery}`).all()
  }

  findAll(table: Tables) {
    return this.sqlite.prepare(`SELECT * FROM ${table}`).all()
  }

  create(table: Tables, data: any, skipWhenExist: boolean = true) {
    if (skipWhenExist && db.find(table, data.id)) return
    return this.sqlite.prepare(`INSERT INTO ${table} VALUES (?)`).run(data)
  }

  createMany(table: Tables, data: any[], skipWhenExist: boolean = true) {
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

  upsert(table: Tables, data: any) {
    const valuesQuery = Object.keys(data)
      .map(key => `:${key}`)
      .join(', ')
    return this.sqlite
      .prepare(`INSERT OR REPLACE INTO ${table} VALUES (${valuesQuery})`)
      .run(data)
  }

  upsertMany(table: Tables, data: any[]) {
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

  delete(table: Tables, key: number | string) {
    return this.sqlite.prepare(`DELETE FROM ${table} WHERE id = ?`).run(key)
  }

  deleteMany(table: Tables, keys: number[] | string[]) {
    const idsQuery = keys.map(key => `id = ${key}`).join(' OR ')
    return this.sqlite.prepare(`DELETE FROM ${table} WHERE ${idsQuery}`).run()
  }

  truncate(table: Tables) {
    return this.sqlite.prepare(`DELETE FROM ${table}`).run()
  }

  vacuum() {
    return this.sqlite.prepare('VACUUM').run()
  }
}

export const db = new DB()
