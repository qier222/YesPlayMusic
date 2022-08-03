/* eslint-disable @typescript-eslint/no-var-requires */
const { rebuild } = require('electron-rebuild')
const fs = require('fs')
const minimist = require('minimist')
const pc = require('picocolors')
const releases = require('electron-releases')
const pkg = require(`${process.cwd()}/package.json`)
const axios = require('axios')
const { execSync } = require('child_process')
const path = require('path')

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

const electronVersion = pkg.devDependencies.electron.replaceAll('^', '')
const betterSqlite3Version = pkg.dependencies['better-sqlite3'].replaceAll(
  '^',
  ''
)
const electronModuleVersion = releases.find(r =>
  r.version.includes(electronVersion)
)?.deps?.modules
const argv = minimist(process.argv.slice(2))

const projectDir = path.resolve(process.cwd(), '../../')

if (!fs.existsSync(`${projectDir}/packages/desktop/dist/binary`)) {
  fs.mkdirSync(`${projectDir}/packages/desktop/dist/binary`, {
    recursive: true,
  })
}

const download = async arch => {
  console.log(pc.cyan(`Downloading for ${arch}...`))
  if (!electronModuleVersion) {
    console.log(pc.red('No electron module version found! Skip download.'))
    return false
  }
  const dir = `${projectDir}/tmp/better-sqlite3`
  const fileName = `better-sqlite3-v${betterSqlite3Version}-electron-v${electronModuleVersion}-${process.platform}-${arch}`
  const zipFileName = `${fileName}.tar.gz`
  const url = `https://github.com/JoshuaWise/better-sqlite3/releases/download/v${betterSqlite3Version}/${zipFileName}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }

  try {
    await axios({
      method: 'get',
      url,
      responseType: 'stream',
    }).then(response => {
      response.data.pipe(fs.createWriteStream(`${dir}/${zipFileName}`))
      return true
    })
  } catch (e) {
    console.log(pc.red('Download failed! Skip download.'))
    return false
  }

  try {
    execSync(`tar -xvzf ${dir}/${zipFileName} -C ${dir}`)
  } catch (e) {
    console.log(pc.red('Extract failed! Skip extract.'))
    return false
  }

  try {
    fs.copyFileSync(
      `${dir}/build/Release/better_sqlite3.node`,
      `${projectDir}/packages/desktop/dist/binary/better_sqlite3_${arch}.node`
    )
  } catch (e) {
    console.log(pc.red('Copy failed! Skip copy.', e))
    return false
  }

  try {
    fs.rmSync(`${dir}/build`, { recursive: true, force: true })
  } catch (e) {
    console.log(pc.red('Delete failed! Skip delete.'))
    return false
  }

  return true
}

const build = async arch => {
  const downloaded = await download(arch)
  if (downloaded) return

  console.log(pc.cyan(`Building for ${arch}...`))
  await rebuild({
    projectRootPath: projectDir,
    buildPath: process.cwd(),
    electronVersion,
    arch,
    onlyModules: ['better-sqlite3'],
    force: true,
  })
    .then(() => {
      console.info('Build succeeded')
      fs.copyFileSync(
        `${projectDir}/node_modules/better-sqlite3/build/Release/better_sqlite3.node`,
        `${projectDir}/packages/desktop/dist/binary/better_sqlite3_${arch}.node`
      )
    })
    .catch(e => {
      console.error(pc.red('Build failed!'))
      console.error(pc.red(e))
    })
}

const main = async () => {
  if (argv.x64 || argv.arm64 || argv.arm) {
    if (argv.x64) await build('x64')
    if (argv.arm64) await build('arm64')
    if (argv.arm) await build('arm')
  } else {
    if (isWindows || isMac) {
      await build('x64')
      await build('arm64')
    } else if (isLinux) {
      await build('x64')
      await build('arm64')
      await build('arm')
    }
  }
}

main()
