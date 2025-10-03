const { cloud, login_cellphone } = require('../main')
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const logger = require('../util/logger.js')

const MUSIC_FILE_EXTENSIONS = new Set(['.mp3', '.flac'])

function getAllMusicFiles(dir, arrayOfFiles) {
  arrayOfFiles = arrayOfFiles || []

  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      getAllMusicFiles(fullPath, arrayOfFiles)
    } else {
      if (MUSIC_FILE_EXTENSIONS.has(path.extname(fullPath))) {
        arrayOfFiles.push(fullPath)
      }
    }
  })

  return arrayOfFiles
}

async function uploadArrayOfFile(token, arrayOfFiles) {
  let failedFiles = []
  let failed = 0
  const fileCount = arrayOfFiles.length
  for (let k in arrayOfFiles) {
    const file = arrayOfFiles[k]
    try {
      await cloud({
        songFile: {
          name: path.basename(file),
          data: fs.readFileSync(file),
        },
        cookie: token.body.cookie,
      })
    } catch (error) {
      logger.info(error)
      failed += 1
      failedFiles.push(file)
    }
    logger.info(`Uploaded ${k + 1}/${fileCount} songs`)
  }
  return { failedFiles, failed }
}

function getParsedArgs() {
  return yargs(process.argv.slice(2))
    .option('country_code', {
      default: '86',
      describe: 'The country code of your phone number',
      type: 'string',
    })
    .option('phone_number', {
      demandOption: true,
      describe: 'Your phone number',
      type: 'string',
    })
    .option('password', {
      demandOption: true,
      describe: 'Your password',
      type: 'string',
    })
    .option('file', {
      describe: 'The absolute path to the single music file to be uploaded',
      type: 'string',
    })
    .option('dir', {
      describe: 'The absolute to the directory of music files to be uploaded',
      type: 'string',
    })
    .conflicts('file', 'dir')
    .help()
    .alias('help', 'h').argv
}

async function main() {
  const args = getParsedArgs()
  const token = await login_cellphone({
    countrycode: args.country_code,
    phone: args.phone_number,
    password: args.password,
  })
  const files = args.file ? [args.file] : getAllMusicFiles(args.dir)
  const fileCount = files.length

  logger.info(`Found ${fileCount} files, uploading...`)
  let res = await uploadArrayOfFile(token, files)
  if (res.failed) {
    logger.info(`Failed to upload ${res.failed} songs, retrying...`)
    res = await uploadArrayOfFile(token, res.failedFiles)
  }

  logger.info(`Uploaded ${fileCount - res.failed} songs`)
  logger.info(
    `Failed to upload ${res.failed} songs, you can reupload the files below`,
  )
  for (let k in res.failedFiles) {
    logger.info(res.failedFiles[k])
  }
}
main()
