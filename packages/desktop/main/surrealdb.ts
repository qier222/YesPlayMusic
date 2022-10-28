import axios, { AxiosInstance } from 'axios'
import { app, ipcMain } from 'electron'
import path from 'path'
import { Get } from 'type-fest'
import { $, fs } from 'zx'
import log from './log'
import { flatten } from 'lodash'

// surreal start --bind 127.0.0.1:37421 --user user --pass pass --log trace file:///Users/max/Developer/GitHub/replay/tmp/UserData/api_cache/surreal

interface Databases {
  appleMusic: {
    artist: {
      key: string
      data: {
        json: string
      }
    }
    album: {
      key: string
      data: {
        json: string
      }
    }
  }
  replay: {
    appData: {
      id: 'appVersion' | 'skippedVersion'
      value: string
    }
  }
  netease: {
    track: {
      id: number
      json: string
      updatedAt: number
    }
    artist: {
      id: number
      json: string
      updatedAt: number
    }
    album: {
      id: number
      json: string
      updatedAt: number
    }
    artistAlbums: {
      id: number
      json: string
      updatedAt: number
    }
    lyric: {
      id: number
      json: string
      updatedAt: number
    }
    playlist: {
      id: number
      json: string
      updatedAt: number
    }
    accountData: {
      id: string
      json: string
      updatedAt: number
    }
    audio: {
      id: number
      br: number
      type: 'mp3' | 'flac' | 'ogg' | 'wav' | 'm4a' | 'aac' | 'unknown' | 'opus'
      source:
        | 'unknown'
        | 'netease'
        | 'migu'
        | 'kuwo'
        | 'kugou'
        | 'youtube'
        | 'qq'
        | 'bilibili'
        | 'joox'
      queriedAt: number
    }
  }
}

interface SurrealSuccessResult<R> {
  time: string
  status: 'OK' | 'ERR'
  result?: R[]
  detail?: string
}

interface SurrealErrorResult {
  code: 400
  details: string
  description: string
  information: string
}

class Surreal {
  private port = 37421
  private username = 'user'
  private password = 'pass'
  private request: AxiosInstance

  constructor() {
    this.start()
    this.request = axios.create({
      baseURL: `http://127.0.0.1:${this.port}`,
      timeout: 15000,
      auth: {
        username: this.username,
        password: this.password,
      },
      headers: {
        NS: 'replay',
        Accept: 'application/json',
      },
      responseType: 'json',
    })
  }

  getSurrealBinPath() {
    return path.join(__dirname, `./binary/surreal`)
  }

  getDatabasePath() {
    return path.resolve(app.getPath('userData'), './api_cache/surreal')
  }

  getKey(table: string, key: string) {
    if (key.includes('/')) {
      return `${table}:⟨${key}⟩`
    }
    return `${table}:${key}`
  }

  async query<R>(
    database: keyof Databases,
    query: string
  ): Promise<R[] | undefined> {
    type DBResponse =
      | SurrealSuccessResult<R>
      | Array<SurrealSuccessResult<R>>
      | SurrealErrorResult

    const result = await this.request
      .post<DBResponse | undefined>('/sql', query, {
        headers: { DB: database },
      })
      .catch(e => {
        log.error(
          `[surreal] Axios Error: ${e}, response: ${JSON.stringify(
            e.response.data,
            null,
            2
          )}`
        )
      })

    if (!result?.data) {
      log.error(`[surreal] No result`)
      return []
    }
    const data = result.data

    if (Array.isArray(data)) {
      return flatten(data.map(item => item?.result).filter(Boolean) as R[][])
    }

    if ('status' in data) {
      if (data.status === 'OK') {
        return data.result
      }
      if (data.status === 'ERR') {
        log.error(`[surreal] ${data.detail}`)
        throw new Error(`[surreal] query error: ${data.detail}`)
      }
    }

    if ('code' in data && data.code !== 400) {
      throw new Error(`[surreal] query error: ${data.description}`)
    }

    throw new Error('[surreal] query error: unknown error')
  }

  async start() {
    log.info(`[surreal] Starting surreal, listen on 127.0.0.1:${this.port}`)

    await $`${this.getSurrealBinPath()} start  --bind 127.0.0.1:${
      this.port
    } --user ${this.username} --pass ${
      this.password
    } --log warn file://${this.getDatabasePath()}`
  }

  async create<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    key: Get<Databases[D][T], 'key'>,
    data: Get<Databases[D][T], 'data'>
  ) {
    const result = await this.query<Get<Databases[D][T], 'data'>>(
      database,
      `CREATE ${String(table)}:(${String(key)}) CONTENT ${JSON.stringify(data)}`
    )
    return result?.[0]
  }

  async upsert<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    key: Get<Databases[D][T], 'key'>,
    data: Get<Databases[D][T], 'data'>
  ) {
    fs.writeFile(
      'tmp.json',
      `INSERT INTO ${String(table)} ${JSON.stringify({ ...data, id: key })}`
    )
    const result = await this.query<Get<Databases[D][T], 'data'>>(
      database,
      `INSERT INTO ${String(table)} ${JSON.stringify({ ...data, id: key })} `
    )
    return result?.[0]
  }

  upsertMany<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    data: {
      key: Get<Databases[D][T], 'key'>
      data: Get<Databases[D][T], 'data'>
    }[]
  ) {
    const queries = data.map(query => {
      return `INSERT INTO ${String(table)} ${JSON.stringify(query.data)};`
    })
    return this.query<Get<Databases[D][T], 'data'>>(database, queries.join(' '))
  }

  async find<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    key: Get<Databases[D][T], 'key'>
  ) {
    return this.query<Get<Databases[D][T], 'data'>>(
      database,
      `SELECT * FROM ${String(table)} WHERE id = "${this.getKey(
        String(table),
        String(key)
      )}" LIMIT 1`
    ) as Promise<Get<Databases[D][T], 'data'>[]>
  }

  async findMany<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    keys: Get<Databases[D][T], 'key'>[]
  ) {
    const idsQuery = keys
      .map(key => `id = "${this.getKey(String(table), String(key))}"`)
      .join(' OR ')
    return this.query<Get<Databases[D][T], 'data'>>(
      database,
      `SELECT * FROM ${String(table)} WHERE ${idsQuery} TIMEOUT 5s`
    )
  }

  async delete<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T,
    key: Get<Databases[D][T], 'key'>
  ) {
    try {
      await this.query(
        database,
        `SELECT ${this.getKey(String(table), String(key))}`
      )
      return true
    } catch (error) {
      return false
    }
  }

  async deleteTable<D extends keyof Databases, T extends keyof Databases[D]>(
    database: D,
    table: T
  ) {
    try {
      await this.query(database, `DELETE ${String(table)}`)
      return true
    } catch (error) {
      return false
    }
  }
}

const surreal = new Surreal()
export default surreal
