import { BrowserWindow, ipcMain, app } from 'electron'
import { db, Tables } from './db'
import { IpcChannels, IpcChannelsParams } from '../shared/IpcChannels'
import cache from './cache'
import log from './log'
import fs from 'fs'
import { APIs } from '../shared/CacheAPIs'
import { YPMTray } from 'tray'

const on = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: Electron.IpcMainEvent, params: IpcChannelsParams[T]) => void
) => {
  ipcMain.on(channel, listener)
}

export function initIpcMain(win: BrowserWindow | null, tray: YPMTray | null) {
  initWindowIpcMain(win)
  initTrayIpcMain(tray)
}

/**
 * 处理需要win对象的事件
 * @param {BrowserWindow} win
 */
function initWindowIpcMain(win: BrowserWindow | null) {
  on(IpcChannels.Minimize, () => {
    win?.minimize()
  })

  on(IpcChannels.MaximizeOrUnmaximize, () => {
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  on(IpcChannels.Close, () => {
    app.exit()
  })
}

/**
 * 处理需要tray对象的事件
 * @param {YPMTray} tray
 */
function initTrayIpcMain(tray: YPMTray | null) {
  on(IpcChannels.SetTrayTooltip, (e, { text }) => tray?.setTooltip(text))

  on(IpcChannels.SetTrayLikeState, (e, { isLiked }) =>
    tray?.setLikeState(isLiked)
  )

  on(IpcChannels.Play, () => tray?.setPlayState(true))
  on(IpcChannels.Pause, () => tray?.setPlayState(false))

  on(IpcChannels.Repeat, (e, { mode }) => tray?.setRepeatMode(mode))
}

/**
 * 清除API缓存
 */
on(IpcChannels.ClearAPICache, () => {
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
on(IpcChannels.GetApiCacheSync, (event, args) => {
  const { api, query } = args
  const data = cache.get(api, query)
  event.returnValue = data
})

/**
 * 缓存封面颜色
 */
on(IpcChannels.CacheCoverColor, (event, args) => {
  const { id, color } = args
  cache.set(APIs.CoverColor, { id, color })
})

/**
 * 导出tables到json文件，方便查看table大小（dev环境）
 */
if (process.env.NODE_ENV === 'development') {
  on(IpcChannels.DevDbExportJson, () => {
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
