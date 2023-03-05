/* eslint-disable @typescript-eslint/no-var-requires */
const { rebuild } = require('electron-rebuild')
const fs = require('fs')
const minimist = require('minimist')
const pc = require('picocolors')
const pkg = require(`${process.cwd()}/package.json`)
const axios = require('axios')
const { execSync } = require('child_process')
const { resolve } = require('path')
const { promisify } = require('util')
const stream = require('stream')

type Arch = typeof process.arch

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

const argv = minimist(process.argv.slice(2))
const electronVersion = pkg.devDependencies.electron.replaceAll('^', '')
const betterSqlite3Version = pkg.dependencies['better-sqlite3'].replaceAll('^', '')

const projectDir = resolve(process.cwd(), '../../')
const tmpDir = resolve(projectDir, `./tmp/better-sqlite3`)
const binDir = resolve(projectDir, `./tmp/bin`)
console.log(pc.cyan(`projectDir=${projectDir}`))
console.log(pc.cyan(`binDir=${binDir}`))

const finished = promisify(stream.finished)

if (!fs.existsSync(binDir)) {
  console.log(pc.cyan(`Creating dist/binary directory: ${binDir}`))
  fs.mkdirSync(binDir, {
    recursive: true,
  })
}

// Get Electron Module Version
let electronModuleVersion = ''
async function getElectronModuleVersion() {
  const releases = await axios.get('https://releases.electronjs.org/releases.json')
  if (!releases.data) {
    console.error(pc.red('Can not get electron releases'))
    process.exit(1)
  }
  electronModuleVersion = releases.data.find(r => r.version.includes(electronVersion))?.modules
  if (!electronModuleVersion) {
    console.error(pc.red('Can not find electron module version in electron-releases'))
    process.exit(1)
  }
  console.log(pc.cyan(`electronModuleVersion=${electronModuleVersion}`))
}

// Download better-sqlite library from GitHub Release
async function download(arch: Arch) {
  console.log(pc.cyan(`Downloading ${arch} binary...`))
  if (!electronModuleVersion) {
    console.log(pc.red('No electron module version found! Skip download.'))
    return false
  }
  const fileName = `better-sqlite3-v${betterSqlite3Version}-electron-v${electronModuleVersion}-${process.platform}-${arch}`
  const zipFileName = `${fileName}.tar.gz`
  const url = `https://github.com/JoshuaWise/better-sqlite3/releases/download/v${betterSqlite3Version}/${zipFileName}`
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, {
      recursive: true,
    })
  }

  try {
    await axios({
      method: 'get',
      url,
      responseType: 'stream',
    }).then(response => {
      const writer = fs.createWriteStream(resolve(tmpDir, `./${zipFileName}`))
      response.data.pipe(writer)
      return finished(writer)
    })
  } catch (e) {
    console.log(pc.red('Download failed! Skip download.', e))
    return false
  }

  try {
    execSync(`tar -xvzf ${tmpDir}/${zipFileName} -C ${tmpDir}`)
  } catch (e) {
    console.log(pc.red('Extract failed! Skip extract.', e))
    return false
  }

  try {
    fs.copyFileSync(
      resolve(tmpDir, './build/Release/better_sqlite3.node'),
      resolve(binDir, `./better_sqlite3_${process.platform}_${arch}.node`)
    )
  } catch (e) {
    console.log(pc.red('Copy failed! Skip copy.', e))
    return false
  }

  try {
    fs.rmSync(resolve(tmpDir, `./build`), { recursive: true, force: true })
  } catch (e) {
    console.log(pc.red('Delete failed! Skip delete.'))
    return false
  }

  return true
}

// Build better-sqlite library on this device
async function build(arch: Arch) {
  const downloaded = await download(arch)
  if (downloaded) {
    return
  }

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

      const from = resolve(
        projectDir,
        `./node_modules/better-sqlite3/build/Release/better_sqlite3.node`
      )
      const to = resolve(binDir, `./better_sqlite3_${process.platform}_${arch}.node`)
      console.info(`copy ${from} to ${to}`)
      fs.copyFileSync(from, to)
    })
    .catch(e => {
      console.error(pc.red('Build failed!'))
      console.error(pc.red(e))
    })
}

async function main() {
  await getElectronModuleVersion()
  if (argv.x64 || argv.arm64 || argv.arm) {
    if (argv.x64) await build('x64')
    if (argv.arm64) await build('arm64')
  } else {
    if (isWindows) {
      await build('x64')
    } else if (isMac) {
      await build('x64')
      await build('arm64')
    } else if (isLinux) {
      await build('x64')
      await build('arm64')
    }
  }
}

main()
