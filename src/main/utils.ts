import fs from 'fs'

export const createDirIfNotExist = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export const createFileIfNotExist = (file: string) => {
  createDirIfNotExist(file.split('/').slice(0, -1).join('/'))
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '')
  }
}
