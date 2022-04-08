import { BrowserWindow, ipcMain, app } from 'electron'
import { db, Tables } from './db'

export enum Events {
  ClearAPICache = 'clear-api-cache',
  Minimize = 'minimize',
  MaximizeOrUnmaximize = 'maximize-or-unmaximize',
  Close = 'close',
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

export function initIpcMain(win: BrowserWindow | null) {
  ipcMain.on(Events.Minimize, () => {
    win?.minimize()
  })

  ipcMain.on(Events.MaximizeOrUnmaximize, () => {
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  ipcMain.on(Events.Close, () => {
    app.exit()
  })
}