import { BrowserWindow, ipcMain, app } from 'electron'
import { db, Tables } from './db'
import { IpcChannels } from './IpcChannelsName'
import { getCache } from './cache'
import logger from './logger'
import fs from 'fs'

/**
 * 处理需要win对象的事件
 * @param {BrowserWindow} win
 */
export function initIpcMain(win: BrowserWindow | null) {
  ipcMain.on(IpcChannels.Minimize, () => {
    win?.minimize()
  })

  ipcMain.on(IpcChannels.MaximizeOrUnmaximize, () => {
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  ipcMain.on(IpcChannels.Close, () => {
    app.exit()
  })
}

/**
 * 清除API缓存
 */
ipcMain.on(IpcChannels.ClearAPICache, () => {
  db.truncate(Tables.TRACK)
  db.truncate(Tables.ALBUM)
  db.truncate(Tables.ARTIST)
  db.truncate(Tables.PLAYLIST)
  db.truncate(Tables.ARTIST_ALBUMS)
  db.truncate(Tables.ACCOUNT_DATA)
  db.truncate(Tables.AUDIO)
  db.vacuum()
})

/**
 * Get API cache
 */
ipcMain.on(IpcChannels.GetApiCacheSync, (event, args) => {
  const { api, query } = args
  const data = getCache(api, query)
  event.returnValue = data
})

/**
 * 导出tables到json文件，方便查看table大小（dev环境）
 */
if (process.env.NODE_ENV === 'development') {
  ipcMain.on(IpcChannels.DevDbExportJson, () => {
    const tables = [
      Tables.ARTIST_ALBUMS,
      Tables.PLAYLIST,
      Tables.ALBUM,
      Tables.TRACK,
      Tables.ARTIST,
      Tables.AUDIO,
      Tables.ACCOUNT_DATA,
      Tables.LYRIC,
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
}
