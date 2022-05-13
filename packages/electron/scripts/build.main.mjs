import { build } from 'esbuild'
import ora from 'ora'
import { builtinModules } from 'module'
import electron from 'electron'
import { spawn } from 'child_process'
import path from 'path'
import waitOn from 'wait-on'
import dotenv from 'dotenv'
import pc from 'picocolors'
import minimist from 'minimist'

const env = dotenv.config({
  path: path.resolve(process.cwd(), '../../.env'),
})
const envForEsbuild = {}
Object.entries(env.parsed || {}).forEach(([key, value]) => {
  envForEsbuild[`process.env.${key}`] = `"${value}"`
})
console.log(envForEsbuild)

const argv = minimist(process.argv.slice(2))
const TAG = '[script/build.main.ts]'
const spinner = ora(`${TAG} Main Process Building...`)

const options = {
  entryPoints: ['./main/index.ts', './main/rendererPreload.ts'],
  outdir: './dist',
  platform: 'node',
  format: 'cjs',
  bundle: true,
  define: envForEsbuild,
  minify: true,
  external: [
    ...builtinModules.filter(
      x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)
    ),
    'electron',
    'NeteaseCloudMusicApi',
    'better-sqlite3',
    '@unblockneteasemusic/rust-napi',
  ],
}

const runApp = () => {
  return spawn(electron, [path.resolve(process.cwd(), './dist/index.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  })
}

if (argv.watch) {
  waitOn(
    {
      resources: [
        `http://127.0.0.1:${process.env.ELECTRON_WEB_SERVER_PORT}/index.html`,
      ],
      timeout: 5000,
    },
    err => {
      if (err) {
        console.log(err)
        process.exit(1)
      } else {
        let child
        build({
          ...options,
          watch: {
            onRebuild(error) {
              if (error) {
                console.error(pc.red('Rebuild Failed:'), error)
              } else {
                console.log(pc.green('Rebuild Succeeded'))
                if (child) child.kill()
                child = runApp()
              }
            },
          },
          sourcemap: true,
        }).then(() => {
          console.log(pc.yellow(`⚡ Run App`))
          if (child) child.kill()
          child = runApp()
        })
      }
    }
  )
} else {
  spinner.start()
  build({
    ...options,
    define: {
      ...options.define,
      'process.env.NODE_ENV': '"production"',
    },
  })
    .then(() => {
      console.log(TAG, pc.green('Main Process Build Succeeded.'))
    })
    .catch(error => {
      console.log(
        `\n${TAG} ${pc.red('Main Process Build Failed')}\n`,
        error,
        '\n'
      )
    })
    .finally(() => {
      spinner.stop()
    })
}
