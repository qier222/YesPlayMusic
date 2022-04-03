import { rebuild } from 'electron-rebuild'
import fs from 'fs'
import minimist from 'minimist'
import pc from 'picocolors'

const pkg = JSON.parse(await fs.readFileSync('./package.json', 'utf8'))
const electronVersion = pkg.devDependencies.electron.replaceAll('^', '')
const argv = minimist(process.argv.slice(2))

const build = async arch => {
  console.log(pc.blue(`Building for ${arch}...`))
  await rebuild({
    buildPath: process.cwd(),
    electronVersion,
    arch: arch,
  })
    .then(() => {
      console.info('Rebuild succeeded')
      if (!fs.existsSync('./dist/main')) {
        fs.mkdirSync('./dist/main', { recursive: true })
      }
      fs.copyFileSync(
        './node_modules/better-sqlite3/build/Release/better_sqlite3.node',
        `./dist/main/better_sqlite3_${arch}.node`
      )
    })
    .catch(e => {
      console.error(pc.red('Rebuild failed!'))
      console.error(pc.red(e))
    })
}

const main = async () => {
  if (argv.x64) await build('x64')
  if (argv.arm64) await build('arm64')
  if (argv.arm) await build('arm')
}

main()
