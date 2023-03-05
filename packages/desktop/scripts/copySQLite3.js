/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const pc = require('picocolors')
const fs = require('fs')

const archs = ['ia32', 'x64', 'armv7l', 'arm64', 'universal']

const projectDir = path.resolve(process.cwd(), '../../')
const binDir = `${projectDir}/tmp/bin`
console.log(pc.cyan(`projectDir=${projectDir}`))
console.log(pc.cyan(`binDir=${binDir}`))

exports.default = async function (context) {
  // console.log(context)
  const platform = context.electronPlatformName
  const arch = archs?.[context.arch]

  // Mac
  if (platform === 'darwin') {
    if (arch === 'universal') return // Skip universal we already copy binary for x64 and arm64
    if (arch !== 'x64' && arch !== 'arm64') return // Skip other archs

    const from = `${binDir}/better_sqlite3_darwin_${arch}.node`
    const to = `${context.appOutDir}/${context.packager.appInfo.productFilename}.app/Contents/Resources/bin/better_sqlite3.node`
    console.info(`copy ${from} to ${to}`)

    const toFolder = to.replace('/better_sqlite3.node', '')
    if (!fs.existsSync(toFolder)) {
      fs.mkdirSync(toFolder, {
        recursive: true,
      })
    }

    try {
      fs.copyFileSync(from, to)
    } catch (e) {
      console.log(pc.red('Copy failed! Process stopped.'))
      throw e
    }
  }

  if (platform === 'win32') {
    if (arch !== 'x64') return // Skip other archs

    const from = `${binDir}/better_sqlite3_win32_${arch}.node`
    const to = `${context.appOutDir}/resources/bin/better_sqlite3.node`
    console.info(`copy ${from} to ${to}`)

    const toFolder = to.replace('/better_sqlite3.node', '')
    if (!fs.existsSync(toFolder)) {
      fs.mkdirSync(toFolder, {
        recursive: true,
      })
    }

    try {
      fs.copyFileSync(from, to)
    } catch (e) {
      console.log(pc.red('Copy failed! Process stopped.'))
      throw e
    }
  }
}
