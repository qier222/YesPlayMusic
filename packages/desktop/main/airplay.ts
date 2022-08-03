import { $ } from 'zx'
import store from './store'
import { ipcMain, BrowserWindow } from 'electron'
import { getNetworkInfo, sleep } from './utils'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import log from './log'

type Protocol = 'dmap' | 'mrp' | 'airplay' | 'companion' | 'raop'
interface Device {
  name: string
  address: string
  identifier: string
  services: { protocol: Protocol; port: number }[]
}

class Airplay {
  devices: Device[] = []
  pairProcess: ChildProcessWithoutNullStreams | null = null
  window: BrowserWindow

  constructor(window: BrowserWindow) {
    log.debug('[airplay] ini')
    this.window = window
    this.initIpc()
  }

  async checkIsInstalled() {
    const help = (await $`atvscript -h`).toString()
    return String(help).includes('usage: atvscript')
  }

  async scanDevices(excludeThisDevice: boolean = true) {
    if (!this.checkIsInstalled()) {
      return {
        result: 'failure',
        error: 'pyatv is not installed',
      }
    }

    let scanResult = null
    try {
      scanResult = await $`atvscript scan`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    let json = null
    try {
      json = JSON.parse(scanResult.toString())
    } catch (e) {
      return {
        result: 'failure',
        error: String(e),
      }
    }

    if (excludeThisDevice) {
      const macAddress = getNetworkInfo()?.mac
      if (macAddress) {
        json.devices = json.devices.filter(
          (device: Device) =>
            device.identifier.toLowerCase() !== macAddress.toLowerCase()
        )
      }
    }

    if (json.result === 'success') {
      this.devices = json.devices
    }

    return json
  }

  async pairDevice(deviceID: string, protocol: Protocol) {
    this.pairProcess = spawn('atvremote', [
      '--id',
      deviceID,
      '--protocol',
      protocol,
      'pair',
    ])

    let paired = false
    let done = false
    this.pairProcess.stdout.on('data', (data: any) => {
      console.log('stdout', String(data))
      if (data.includes('You may now use these credentials:')) {
        store.set(
          `airplay.credentials.${deviceID}`,
          String(data).split('credentials:')[1].trim()
        )
        paired = true
        done = true
      }
      if (data.includes('Pairing failed')) {
        paired = false
        done = true
      }
    })

    while (!done) {
      console.log('not done yet')
      await sleep(1000)
    }

    return paired
  }

  async enterPairPin(pin: string) {
    if (!this.pairProcess) {
      return false
    }
    this.pairProcess.stdin.write(`${pin}\n`)
    return true
  }

  async playUrl(deviceID: string, url: string) {
    log.debug(`[airplay] playUrl ${url}`)
    const credentials: string = store.get(`airplay.credentials.${deviceID}`)
    if (url.includes('127.0.0.1')) {
      const ip = getNetworkInfo()?.address
      if (ip) url = url.replace('127.0.0.1', ip)
    }

    try {
      spawn('atvremote', [
        '--id',
        deviceID,
        '--airplay-credentials',
        credentials,
        `play_url=${url}`,
      ])
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }
  }

  async getPlaying(deviceID: string) {
    if (!this.checkIsInstalled()) {
      return {
        result: 'failure',
        error: 'pyatv is not installed',
      }
    }

    const credentials = store.get(`airplay.credentials.${deviceID}`)

    let playing = null
    try {
      playing =
        await $`atvscript --id ${deviceID}  --airplay-credentials=${credentials} playing`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    let json = null
    try {
      json = JSON.parse(playing.toString())
    } catch (e) {
      return {
        result: 'failure',
        error: String(e),
      }
    }

    return json
  }

  async play(deviceID: string) {
    const credentials = store.get(`airplay.credentials.${deviceID}`)
    try {
      $`atvscript --id ${deviceID} --airplay-credentials ${credentials} play`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    return {
      result: 'success',
    }
  }

  async pause(deviceID: string) {
    const credentials = store.get(`airplay.credentials.${deviceID}`)
    try {
      $`atvscript --id ${deviceID} --airplay-credentials ${credentials} pause`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    return {
      result: 'success',
    }
  }

  async playOrPause(deviceID: string) {
    const credentials = store.get(`airplay.credentials.${deviceID}`)
    try {
      $`atvscript --id ${deviceID} --airplay-credentials ${credentials} play_pause`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    return {
      result: 'success',
    }
  }

  async setProgress(deviceID: string, progress: number) {
    const credentials = store.get(`airplay.credentials.${deviceID}`)
    try {
      $`atvremote --id ${deviceID} --airplay-credentials ${credentials} set_position=${progress}`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    return {
      result: 'success',
    }
  }

  async pushUpdates(deviceID: string) {
    const credentials = store.get(`airplay.credentials.${deviceID}`)
    let updates = null
    try {
      updates = $`atvscript --id ${deviceID} --airplay-credentials ${credentials} push_updates`
    } catch (p: any) {
      return {
        result: 'failure',
        error: p.stderr,
      }
    }

    for await (const chunk of updates.stdout) {
      this.window.webContents.send('airplay-updates', chunk)
    }
  }

  async initIpc() {
    ipcMain.handle('airplay-scan-devices', () => {
      return this.scanDevices()
    })

    ipcMain.handle('airplay-pair', async () => {
      console.log('airplay-pair')
      return this.pairDevice('58:D3:49:F0:C9:71', 'airplay')
    })

    ipcMain.handle('airplay-pair-enter-pin', async (e, pin) => {
      return this.enterPairPin(pin)
    })

    ipcMain.handle('airplay-play-url', async (e, { deviceID, url }) => {
      return this.playUrl(deviceID, url)
    })

    ipcMain.handle('airplay-get-playing', async (e, { deviceID }) => {
      return this.getPlaying(deviceID)
    })
  }
}

export default Airplay
