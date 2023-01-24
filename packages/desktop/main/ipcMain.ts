import { BrowserWindow, ipcMain, app } from 'electron'
// import { db, Tables } from './db'
import { IpcChannels, IpcChannelsParams } from '@/shared/IpcChannels'
import cache from './cache'
import log from './log'
import fs from 'fs'
import Store from 'electron-store'
import { TypedElectronStore } from './store'
import { APIs } from '@/shared/CacheAPIs'
import { YPMTray } from './tray'
import { Thumbar } from './windowsTaskbar'
import fastFolderSize from 'fast-folder-size'
import path from 'path'
import prettyBytes from 'pretty-bytes'

const on = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: Electron.IpcMainEvent, params: IpcChannelsParams[T]) => void
) => {
  ipcMain.on(channel, listener)
}

const handle = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: Electron.IpcMainInvokeEvent, params: IpcChannelsParams[T]) => void
) => {
  return ipcMain.handle(channel, listener)
}

export function initIpcMain(
  win: BrowserWindow | null,
  tray: YPMTray | null,
  thumbar: Thumbar | null,
  store: Store<TypedElectronStore>
) {
  initWindowIpcMain(win)
  initTrayIpcMain(tray)
  initTaskbarIpcMain(thumbar)
  initStoreIpcMain(store)
  initOtherIpcMain()
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

  on(IpcChannels.ResetWindowSize, () => {
    if (!win) return
    win?.setSize(1440, 1024, true)
  })

  handle(IpcChannels.IsMaximized, () => {
    if (!win) return
    return win.isMaximized()
  })
}

/**
 * 处理需要tray对象的事件
 * @param {YPMTray} tray
 */
function initTrayIpcMain(tray: YPMTray | null) {
  on(IpcChannels.SetTrayTooltip, (e, { text }) => tray?.setTooltip(text))

  on(IpcChannels.Like, (e, { isLiked }) => tray?.setLikeState(isLiked))

  on(IpcChannels.Play, () => tray?.setPlayState(true))
  on(IpcChannels.Pause, () => tray?.setPlayState(false))

  on(IpcChannels.Repeat, (e, { mode }) => tray?.setRepeatMode(mode))
}

/**
 * 处理需要thumbar对象的事件
 * @param {Thumbar} thumbar
 */
function initTaskbarIpcMain(thumbar: Thumbar | null) {
  on(IpcChannels.Play, () => thumbar?.setPlayState(true))
  on(IpcChannels.Pause, () => thumbar?.setPlayState(false))
}

/**
 * 处理需要electron-store的事件
 * @param {Store<TypedElectronStore>} store
 */
function initStoreIpcMain(store: Store<TypedElectronStore>) {
  /**
   * 同步设置到Main
   */
  on(IpcChannels.SyncSettings, (event, settings) => {
    store.set('settings', settings)
  })
}

/**
 * 处理其他事件
 */
function initOtherIpcMain() {
  /**
   * 清除API缓存
   */
  on(IpcChannels.ClearAPICache, () => {
    // db.truncate(Tables.Track)
    // db.truncate(Tables.Album)
    // db.truncate(Tables.Artist)
    // db.truncate(Tables.Playlist)
    // db.truncate(Tables.ArtistAlbum)
    // db.truncate(Tables.AccountData)
    // db.truncate(Tables.Audio)
    // db.vacuum()
  })

  /**
   * Get API cache
   */
  // on(IpcChannels.GetApiCache, (event, args) => {
  //   const { api, query } = args
  //   const data = cache.get(api, query)
  //   event.returnValue = data
  // })

  handle(IpcChannels.GetApiCache, async (event, args) => {
    const { api, query } = args
    if (api !== 'user/account') {
      return null
    }
    try {
      const data = await cache.get(api, query)
      return data
    } catch {
      return null
    }
  })

  /**
   * 缓存封面颜色
   */
  on(IpcChannels.CacheCoverColor, (event, args) => {
    const { id, color } = args
    cache.set(APIs.CoverColor, { id, color })
  })

  /**
   * 获取音频缓存文件夹大小
   */
  on(IpcChannels.GetAudioCacheSize, event => {
    fastFolderSize(path.join(app.getPath('userData'), './audio_cache'), (error, bytes) => {
      if (error) throw error

      event.returnValue = prettyBytes(bytes ?? 0)
    })
  })

  /**
   * 从Apple Music获取专辑信息
   */
  // handle(
  //   IpcChannels.GetAlbumFromAppleMusic,
  //   async (event, { id, name, artist }) => {
  //     const fromCache = cache.get(APIs.AppleMusicAlbum, { id })
  //     if (fromCache) {
  //       return fromCache === 'no' ? undefined : fromCache
  //     }

  //     const fromApple = await getAlbum({ name, artist })
  //     cache.set(APIs.AppleMusicAlbum, { id, album: fromApple })
  //     return fromApple
  //   }
  // )

  // /**
  //  * 从Apple Music获取歌手信息
  //  **/
  // handle(IpcChannels.GetArtistFromAppleMusic, async (event, { id, name }) => {
  //   const fromApple = await getArtist(name)
  //   cache.set(APIs.AppleMusicArtist, { id, artist: fromApple })
  //   return fromApple
  // })

  // /**
  //  * 从缓存读取Apple Music歌手信息
  //  */
  // on(IpcChannels.GetArtistFromAppleMusic, (event, { id }) => {
  //   const artist = cache.get(APIs.AppleMusicArtist, id)
  //   event.returnValue = artist === 'no' ? undefined : artist
  // })

  /**
   * 退出登陆
   */
  handle(IpcChannels.Logout, async () => {
    // db.truncate(Tables.AccountData)
    return true
  })

  /**
   * 导出tables到json文件，方便查看table大小（dev环境）
   */
  if (process.env.NODE_ENV === 'development') {
    // on(IpcChannels.DevDbExportJson, () => {
    //   const tables = [
    //     Tables.ArtistAlbum,
    //     Tables.Playlist,
    //     Tables.Album,
    //     Tables.Track,
    //     Tables.Artist,
    //     Tables.Audio,
    //     Tables.AccountData,
    //     Tables.Lyric,
    //   ]
    //   tables.forEach(table => {
    //     const data = db.findAll(table)
    //     fs.writeFile(
    //       `./tmp/${table}.json`,
    //       JSON.stringify(data),
    //       function (err) {
    //         if (err) {
    //           return console.log(err)
    //         }
    //         console.log('The file was saved!')
    //       }
    //     )
    //   })
    // })
  }
}
