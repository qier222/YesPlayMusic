import path from 'path'
import { app, ipcMain } from 'electron'
import fs from 'fs'
import SQLite3 from 'better-sqlite3'

export enum Tables {
  TRACK = 'track',
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
  ARTIST_ALBUMS = 'artist_album',
  USER_PLAYLISTS = 'user_playlist',

  // Special tables
  ACCOUNT_DATA = 'account_data',
  AUDIO = 'audio',
}

const sqlite = new SQLite3(
  path.resolve(app.getPath('userData'), './api_cache/db.sqlite')
)

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
}

ipcMain.on('db-export-json', () => {
  const tables = [
    Tables.ARTIST_ALBUMS,
    Tables.PLAYLIST,
    Tables.ALBUM,
    Tables.TRACK,
    Tables.ARTIST,
    Tables.AUDIO,
    Tables.ACCOUNT_DATA,
  ]
  tables.forEach(table => {
    const data = db.findAll(table)

    fs.writeFile(`./tmp/${table}.json`, JSON.stringify(data), function (err) {
      if (err) {
        return console.log(err)
      }
      console.log('The file was saved!')
    })
  })
})
