import { ipcMain } from 'electron'
import { db, Tables } from './db'

export enum Events {
  ClearAPICache = 'clear-api-cache',
}

ipcMain.on(Events.ClearAPICache, () => {
  db.truncate(Tables.TRACK)
  db.truncate(Tables.ALBUM)
  db.truncate(Tables.ARTIST)
  db.truncate(Tables.PLAYLIST)
  db.truncate(Tables.ARTIST_ALBUMS)
  db.truncate(Tables.ACCOUNT_DATA)
  db.truncate(Tables.AUDIO)
  db.vacuum()
})
