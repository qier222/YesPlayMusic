import { spawn } from 'child_process'
import { createServer, build } from 'vite'
import electron from 'electron'
import util from 'util'
import styles from 'ansi-styles'

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchMain(server) {
  /**
   * @type {import('child_process').ChildProcessWithoutNullStreams | null}
   */
  let electronProcess = null
  const address = server.httpServer.address()
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_HOST: address.address,
    VITE_DEV_SERVER_PORT: address.port,
  })

  return build({
    configFile: 'packages/main/vite.config.ts',
    mode: 'development',
    plugins: [
      {
        name: 'electron-main-watcher',
        writeBundle() {
          electronProcess && electronProcess.kill()
          electronProcess = spawn(electron, ['.'], { stdio: 'inherit', env })
        },
      },
    ],
    build: {
      watch: true,
    },
  })
}

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchPreload(server) {
  return build({
    configFile: 'packages/preload/vite.config.ts',
    mode: 'development',
    plugins: [
      {
        name: 'electron-preload-watcher',
        writeBundle() {
          server.ws.send({ type: 'full-reload' })
        },
      },
    ],
    build: {
      watch: true,
    },
  })
}

// log prefix
function logPrefix(fn) {
  const funcs = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: (console.debug || console.log).bind(console),
  }
  const processLogText = (text, prefix) => {
    return text.replaceAll('\n', '\n' + prefix)
  }
  Object.keys(funcs).forEach(function (k) {
    console[k] = function () {
      const string = typeof fn === 'function' ? fn() : fn
      arguments[0] = util.format(string, processLogText(arguments[0], string))
      funcs[k].apply(console, arguments)
    }
  })
}

const color = (hex, text) => {
  return `${styles.color.ansi(styles.hexToAnsi(hex))}${text}${
    styles.color.close
  }`
}

// bootstrap
logPrefix(color('#eab308', '[vite] '))
const server = await createServer({
  configFile: 'packages/renderer/vite.config.ts',
})
await server.listen()
await watchPreload(server)
await watchMain(server)
