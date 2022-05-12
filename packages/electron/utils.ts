import fs from 'fs'
import path from 'path'

export const createDirIfNotExist = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export const createFileIfNotExist = (file: string) => {
  createDirIfNotExist(path.dirname(file))
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '')
  }
}

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isWindows = process.platform === 'win32'
export const isMac = process.platform === 'darwin'
export const isLinux = process.platform === 'linux'
export const dirname = isDev ? process.cwd() : __dirname
