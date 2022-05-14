import fs from 'fs'
import path from 'path'
import pkg from '../../../package.json'
import axios from 'axios'

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isWindows = process.platform === 'win32'
export const isMac = process.platform === 'darwin'
export const isLinux = process.platform === 'linux'
export const dirname = isDev ? process.cwd() : __dirname
export const devUserDataPath = path.resolve(process.cwd(), '../../tmp/userData')
export const portableUserDataPath = path.resolve(
  process.env.PORTABLE_EXECUTABLE_DIR || '',
  './YesPlayMusic-UserData'
)
export const logsPath = {
  linux: `~/.config/${pkg.productName}/logs`,
  darwin: `~/Library/Logs/${pkg.productName}/`,
  win32: `%USERPROFILE%\\AppData\\Roaming\\${pkg.productName}\\logs`,
}[process.platform as 'darwin' | 'win32' | 'linux']

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

export async function getBiliVideo(url: string) {
  const toBuffer = (data: any) =>
    data instanceof Buffer ? data : Buffer.from(data)

  const response = await axios.get(url, {
    headers: {
      Referer: 'https://www.bilibili.com/',
      'User-Agent': 'okhttp/3.4.1',
    },
    responseType: 'arraybuffer',
  })

  const buffer = toBuffer(response.data)
  return buffer.toString('base64')
}
