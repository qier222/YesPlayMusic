import './preload' // must be first
import './sentry'
import './server'
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app,
  shell,
  ipcMain,
} from 'electron'
import Store from 'electron-store'
import { release } from 'os'
import path, { join } from 'path'
import logger from './logger'

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const isDev = process.env.NODE_ENV === 'development'

logger.info('[index] Main process start')

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

interface TypedElectronStore {
  window: {
    width: number
    height: number
    x?: number
    y?: number
  }
}

const store = new Store<TypedElectronStore>({
  defaults: {
    window: {
      width: 1440,
      height: 960,
    },
  },
})

let win: BrowserWindow | null = null

async function createWindow() {
  // Create window

  const options: BrowserWindowConstructorOptions = {
    title: 'Main window',
    webPreferences: {
      preload: join(__dirname, 'rendererPreload.js'),
    },
    width: store.get('window.width'),
    height: store.get('window.height'),
    minWidth: 1080,
    minHeight: 720,
    vibrancy: 'fullscreen-ui',
    titleBarStyle: 'hiddenInset',
    frame: !(isWindows || isLinux) // TODO: 适用于linux下独立的启用开关
  }
  if (store.get('window')) {
    options.x = store.get('window.x')
    options.y = store.get('window.y')
  }
  win = new BrowserWindow(options)

  // Web server
  const url = `http://localhost:${process.env.ELECTRON_WEB_SERVER_PORT}`
  win.loadURL(url)

  if (isDev) {
    win.webContents.openDevTools()
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Save window position
  const saveBounds = () => {
    const bounds = win?.getBounds()
    if (bounds) {
      store.set('window', bounds)
    }
  }
  win.on('resized', saveBounds)
  win.on('moved', saveBounds)
}

app.whenReady().then(async () => {
  logger.info('[index] App ready')
  createWindow()
  handleWindowEvents()

  // Install devtool extension
  if (isDev) {
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('electron-devtools-installer')
    installExtension(REACT_DEVELOPER_TOOLS.id).catch(err =>
      logger.info('An error occurred: ', err)
    )
    installExtension(REDUX_DEVTOOLS.id).catch(err =>
      logger.info('An error occurred: ', err)
    )
  }
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.on('minimize', () => {
  win?.minimize()
})

ipcMain.on('maximize-or-unmaximize', () => {
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.on('close', () => {
  app.exit()
})

const handleWindowEvents = () => {
  win?.on('maximize', () => {
    win?.webContents.send('is-maximized', true)
  })

  win?.on('unmaximize', () => {
    win?.webContents.send('is-maximized', false)
  })
}
