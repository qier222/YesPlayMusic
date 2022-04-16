import { BrowserWindow, ipcMain, app } from 'electron'
import { db, Tables } from './db'
import { IpcChannels } from './IpcChannelsName'
import cache from './cache'
import log from './log'
import fs from 'fs'
import { APIs } from './CacheAPIsName'

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
  db.truncate(Tables.Track)
  db.truncate(Tables.Album)
  db.truncate(Tables.Artist)
  db.truncate(Tables.Playlist)
  db.truncate(Tables.ArtistAlbum)
  db.truncate(Tables.AccountData)
  db.truncate(Tables.Audio)
  db.vacuum()
})

/**
 * Get API cache
 */
ipcMain.on(IpcChannels.GetApiCacheSync, (event, args) => {
  const { api, query } = args
  const data = cache.get(api, query)
  event.returnValue = data
})

/**
 * 缓存封面颜色
 */
ipcMain.on(IpcChannels.CacheCoverColor, (event, args) => {
  const { id, color } = args.query
  cache.set(APIs.CoverColor, { id, color })
})

/**
 * 导出tables到json文件，方便查看table大小（dev环境）
 */
if (process.env.NODE_ENV === 'development') {
  ipcMain.on(IpcChannels.DevDbExportJson, () => {
    const tables = [
      Tables.ArtistAlbum,
      Tables.Playlist,
      Tables.Album,
      Tables.Track,
      Tables.Artist,
      Tables.Audio,
      Tables.AccountData,
      Tables.Lyric,
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
