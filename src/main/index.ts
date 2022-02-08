import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, nativeTheme, protocol } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import Store from 'electron-store'
import express from 'express'
import expressProxy from 'express-http-proxy'
import { join } from 'path'
import '@main/core/ipcMain'
import logger from '@main/core/logger'
import { createNeteaseMusicApi } from '@main/core/netease'
import { TypedElectronStore } from '@main/types'

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const isDev = !app.isPackaged

class Background {
  public window: BrowserWindow
  public willQuitApp: boolean = false
  public neteaseApiServer: express.Express
  public webServer: express.Express
  public store: Store<TypedElectronStore> = new Store<TypedElectronStore>({
    defaults: {
      window: {
        width: 1440,
        height: 960,
      },
    },
  })

  constructor() {
    this.init()
  }

  init() {
    logger.info('Initializing')

    // Make sure the app is singleton.
    if (!app.requestSingleInstanceLock()) return app.quit()

    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'yesplaymusic',
        privileges: {
          secure: true,
          standard: true,
        },
      },
    ])

    this.neteaseApiServer = createNeteaseMusicApi()
    this.createWebServer()

    // Handle app events
    this.handleAppEvents()
  }

  async initDevtools() {
    // Install Vue Devtools extension
    logger.info('Installing vue devtools')
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e: any) {
      logger.warn('Vue Devtools failed to install:', e.toString())
    }

    // Exit cleanly on request from parent process in development mode.
    if (isWindows) {
      process.on('message', data => {
        if (data === 'graceful-exit') {
          app.quit()
        }
      })
    } else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  }

  createWebServer() {
    logger.info('Creating web server (express)')
    if (isDev) {
      logger.debug('Skip create express app in development')
      return
    }

    const expressApp = express()
    logger.info(__dirname, 'dashdiuashduhasodhaosdhaskhdashdiasuh')

    expressApp.use('/', express.static(join(__dirname, '../renderer')))
    expressApp.use(
      '/api',
      expressProxy(`http://127.0.0.1:${process.env.ELECTRON_NETEASE_API_PORT}`)
    )
    this.webServer = expressApp.listen(
      process.env.ELECTRON_WEB_SERVER_PORT,
      '127.0.0.1'
    )
  }

  createWindow() {
    logger.info('Creating app window')

    const appearance = this.store.get('settings.appearance')
    const showLibraryDefault = this.store.get('settings.showLibraryDefault')

    const options: BrowserWindowConstructorOptions = {
      width: this.store.get('window.width'),
      height: this.store.get('window.height'),
      minWidth: 1080,
      minHeight: 720,
      titleBarStyle: 'hiddenInset',
      frame: !isWindows,
      title: 'YesPlayMusic',
      show: false,
      // webPreferences: {
      //   webSecurity: false,
      //   nodeIntegration: true,
      //   // enableRemoteModule: true,
      //   contextIsolation: false,
      // },
      vibrancy: 'fullscreen-ui',
      // backgroundColor:
      //   ((appearance === undefined || appearance === 'auto') &&
      //     nativeTheme.shouldUseDarkColors) ||
      //   appearance === 'dark'
      //     ? '#222'
      //     : '#fff',
    }

    if (this.store.get('window')) {
      options.x = this.store.get('window.x')
      options.y = this.store.get('window.y')
    }

    this.window = new BrowserWindow(options)

    // hide menu bar on Microsoft Windows and Linux
    this.window.setMenuBarVisibility(false)

    this.window.loadURL(
      `http://127.0.0.1:${process.env.ELECTRON_WEB_SERVER_PORT}`
    )

    if (isDev) {
      this.window.webContents.openDevTools()
    }
  }

  handleWindowEvents() {
    this.window.once('ready-to-show', () => {
      logger.info('Window ready-to-show event')
      this.window.show()
    })

    this.window.on('close', e => {
      logger.info('Window close event')

      if (isMac) {
        if (this.willQuitApp) {
          app.quit()
        } else {
          e.preventDefault()
          this.window.hide()
        }
      } else {
        let closeOpt = this.store.get('settings.closeAppOption')
        if (this.willQuitApp && (closeOpt === 'exit' || closeOpt === 'ask')) {
          app.quit()
        } else {
          e.preventDefault()
          this.window.hide()
        }
      }
    })

    this.window.on('resized', () => {
      this.store.set('window', this.window.getBounds())
    })

    this.window.on('moved', () => {
      this.store.set('window', this.window.getBounds())
    })
  }

  handleAppEvents() {
    app.on('ready', async () => {
      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      logger.info('App ready event')

      // for development
      if (isDev) {
        this.initDevtools()
      }

      // create window
      this.createWindow()
      this.handleWindowEvents()
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      logger.info('App activate event')
      if (this.window === null) {
        this.createWindow()
      } else {
        this.window.show()
      }
    })

    app.on('window-all-closed', () => {
      if (!isMac) {
        app.quit()
      }
    })

    app.on('second-instance', () => {
      if (!isMac && this.window) {
        this.window.show()
        if (this.window.isMaximized()) {
          this.window.restore()
        }
        this.window.focus()
      }
    })

    app.on('before-quit', () => {
      this.willQuitApp = true
    })

    app.on('quit', () => {
      // shutdown express servers (netease api and web server)
      this.neteaseApiServer?.server?.close()
      if (!isDev) {
        this.webServer?.server?.close()
      }
    })

    app.on('will-quit', () => {})
  }
}

new Background()
