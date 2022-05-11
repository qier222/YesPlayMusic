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
