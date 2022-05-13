import './preload' // must be first
import './sentry'
import './server'
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app,
  shell,
} from 'electron'
import Store from 'electron-store'
import { release } from 'os'
import { join } from 'path'
import log from './log'
import { initIpcMain } from './ipcMain'
import { createTray, YPMTray } from './tray'
import { IpcChannels } from '@/shared/IpcChannels'
import { createTaskbar, Thumbar } from './windowsTaskbar'
import { createMenu } from './menu'
import { Store as State, initialState } from '@/shared/store'
import { isDev, isWindows, isLinux, isMac } from './utils'

export interface TypedElectronStore {
  window: {
    width: number
    height: number
    x?: number
    y?: number
  }
  settings: State['settings']
}

class Main {
  win: BrowserWindow | null = null
  tray: YPMTray | null = null
  thumbar: Thumbar | null = null
  store = new Store<TypedElectronStore>({
    defaults: {
      window: {
        width: 1440,
        height: 960,
      },
      settings: initialState.settings,
    },
  })

  constructor() {
    log.info('[index] Main process start')

    // Disable GPU Acceleration for Windows 7
    if (release().startsWith('6.1')) app.disableHardwareAcceleration()

    // Set application name for Windows 10+ notifications
    if (process.platform === 'win32') app.setAppUserModelId(app.getName())

    // Make sure the app only run on one instance
    if (!app.requestSingleInstanceLock()) {
      app.quit()
      process.exit(0)
    }

    app.whenReady().then(() => {
      log.info('[index] App ready')
      this.createWindow()
      this.handleAppEvents()
      this.handleWindowEvents()
      this.createTray()
      createMenu(this.win!)
      this.createThumbar()
      initIpcMain(this.win, this.tray, this.thumbar, this.store)
      this.initDevTools()
    })
  }

  initDevTools() {
    if (!isDev || !this.win) return

    // Install devtool extension
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('electron-devtools-installer')
    installExtension(REACT_DEVELOPER_TOOLS.id).catch((err: unknown) =>
      log.info('An error occurred: ', err)
    )

    this.win.webContents.openDevTools()
  }

  createTray() {
    if (isWindows || isLinux || isDev) {
      this.tray = createTray(this.win!)
    }
  }

  createThumbar() {
    if (isWindows) this.thumbar = createTaskbar(this.win!)
  }

  createWindow() {
    const options: BrowserWindowConstructorOptions = {
      title: 'YesPlayMusic',
      webPreferences: {
        preload: join(__dirname, 'rendererPreload.js'),
      },
      width: this.store.get('window.width'),
      height: this.store.get('window.height'),
      minWidth: 1080,
      minHeight: 720,
      vibrancy: 'fullscreen-ui',
      titleBarStyle: 'hiddenInset',
      frame: !(isWindows || isLinux), // TODO: 适用于linux下独立的启用开关
    }
    if (this.store.get('window')) {
      options.x = this.store.get('window.x')
      options.y = this.store.get('window.y')
    }
    this.win = new BrowserWindow(options)

    // Web server
    const url = `http://localhost:${process.env.ELECTRON_WEB_SERVER_PORT}`
    this.win.loadURL(url)

    // Make all links open with the browser, not with the application
    this.win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url)
      return { action: 'deny' }
    })

    this.disableCORS()
  }

  disableCORS() {
    if (!this.win) return
    const upsertKeyValue = (
      object: Record<string, string | string[]>,
      keyToChange: string,
      value: string[]
    ) => {
      if (!object) return
      for (const key of Object.keys(object)) {
        if (key.toLowerCase() === keyToChange.toLowerCase()) {
          object[key] = value
        }
      }
      object[keyToChange] = value
    }

    this.win.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        const { requestHeaders, url } = details
        upsertKeyValue(requestHeaders, 'access-control-allow-origin', ['*'])

        // 不加这几个 header 的话，使用 axios 加载 YouTube 音频会很慢
        if (url.includes('googlevideo.com')) {
          requestHeaders['Sec-Fetch-Mode'] = 'no-cors'
          requestHeaders['Sec-Fetch-Dest'] = 'audio'
          requestHeaders['Range'] = 'bytes=0-'
        }

        callback({ requestHeaders })
      }
    )

    this.win.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        const { responseHeaders } = details
        if (responseHeaders) {
          upsertKeyValue(responseHeaders, 'access-control-allow-origin', ['*'])
          upsertKeyValue(responseHeaders, 'access-control-allow-headers', ['*'])
        }
        callback({
          responseHeaders,
        })
      }
    )
  }

  handleWindowEvents() {
    if (!this.win) return

    // Window maximize and minimize
    this.win.on('maximize', () => {
      this.win && this.win.webContents.send(IpcChannels.IsMaximized, true)
    })

    this.win.on('unmaximize', () => {
      this.win && this.win.webContents.send(IpcChannels.IsMaximized, false)
    })

    // Save window position
    const saveBounds = () => {
      const bounds = this.win?.getBounds()
      if (bounds) {
        this.store.set('window', bounds)
      }
    }
    this.win.on('resized', saveBounds)
    this.win.on('moved', saveBounds)
  }

  handleAppEvents() {
    app.on('window-all-closed', () => {
      this.win = null
      if (!isMac) app.quit()
    })

    app.on('second-instance', () => {
      if (!this.win) return
      // Focus on the main window if the user tried to open another
      if (this.win.isMinimized()) this.win.restore()
      this.win.focus()
    })

    app.on('activate', () => {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length) {
        allWindows[0].focus()
      } else {
        this.createWindow()
      }
    })
  }
}

new Main()
