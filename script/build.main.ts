import { join } from 'path'
import dotenv from 'dotenv'
import { spawn, ChildProcess } from 'child_process'
import electron from 'electron'
import minimist from 'minimist'
import pc from 'picocolors'
import ora from 'ora'
import waitOn from 'wait-on'
import { build } from 'esbuild'
import { main } from '../package.json'
import { createOptions } from './esbuild.options'
dotenv.config({ path: join(__dirname, '../.env') })

const argv = minimist(process.argv.slice(2))
const options = createOptions()
const TAG = '[script/build.main.ts]'
const spinner = ora(`${TAG} Main Process Building...`)

const runApp = () => {
  return spawn(electron as any, [join(__dirname, `../${main}`)], {
    stdio: 'inherit',
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
    (err: any) => {
      if (err) {
        console.log(err)
        process.exit(1)
      } else {
        let child: ChildProcess
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
        }).then(() => {
          console.log(pc.yellow('⚡Run App'))
          if (child) child.kill()
          child = runApp()
        })
      }
    }
  )
} else {
  spinner.start()
  build(options)
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
