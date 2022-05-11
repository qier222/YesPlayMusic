import { pathCase } from 'change-case'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import log from './log'
import cache from './cache'
import fileUpload from 'express-fileupload'
import path from 'path'
import fs from 'fs'
import { db, Tables } from 'db'
import { app } from 'electron'
import type { FetchAudioSourceResponse } from '@/shared/api/Track'
import UNM from '@unblockneteasemusic/rust-napi'
import { APIs as CacheAPIs } from '../shared/CacheAPIs'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

class Server {
  port = Number(
    isProd
      ? process.env.ELECTRON_WEB_SERVER_PORT ?? 42710
      : process.env.ELECTRON_DEV_NETEASE_API_PORT ?? 3000
  )
  app = express()

  constructor() {
    log.info('[server] starting http server')
    this.app.use(cookieParser())
    this.app.use(fileUpload())
    this.getAudioUrlHandler()
    this.neteaseHandler()
    this.cacheAudioHandler()
    this.serveStaticForProd()
    this.listen()
  }

  neteaseHandler() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const neteaseApi = require('NeteaseCloudMusicApi') as (params: any) => any[]

    Object.entries(neteaseApi).forEach(([name, handler]) => {
      if (['serveNcmApi', 'getModulesDefinitions', 'song_url'].includes(name)) {
        return
      }

      name = pathCase(name)

      const wrappedHandler = async (req: Request, res: Response) => {
        log.debug(`[server] Handling request: ${req.path}`)

        // Get from cache
        const cacheData = await cache.getForExpress(name, req)
        if (cacheData) return res.json(cacheData)

        // Request netease api
        try {
          const result = await handler({
            ...req.query,
            cookie: req.cookies,
          })

          cache.set(name, result.body, req.query)
          return res.send(result.body)
        } catch (error: any) {
          if ([400, 301].includes(error.status)) {
            return res.status(error.status).send(error.body)
          }
          return res.status(500)
        }
      }

      this.app.get(`/netease/${name}`, wrappedHandler)
      this.app.post(`/netease/${name}`, wrappedHandler)
    })
  }

  serveStaticForProd() {
    if (isProd) {
      this.app.use('/', express.static(path.join(__dirname, '../web/')))
    }
  }

  getAudioUrlHandler() {
    const getFromCache = (id: number) => {
      // get from cache
      const cache = db.find(Tables.Audio, id)
      if (!cache) return

      const audioFileName = `${cache.id}-${cache.br}.${cache.type}`

      const isAudioFileExists = fs.existsSync(
        `${app.getPath('userData')}/audio_cache/${audioFileName}`
      )
      if (!isAudioFileExists) return

      log.debug(`[server] Audio cache hit for song/url`)

      return {
        data: [
          {
            source: cache.source,
            id: cache.id,
            url: `http://127.0.0.1:42710/yesplaymusic/audio/${audioFileName}`,
            br: cache.br,
            size: 0,
            md5: '',
            code: 200,
            expi: 0,
            type: cache.type,
            gain: 0,
            fee: 8,
            uf: null,
            payed: 0,
            flag: 4,
            canExtend: false,
            freeTrialInfo: null,
            level: 'standard',
            encodeType: cache.type,
            freeTrialPrivilege: {
              resConsumable: false,
              userConsumable: false,
              listenType: null,
            },
            freeTimeTrialPrivilege: {
              resConsumable: false,
              userConsumable: false,
              type: 0,
              remainTime: 0,
            },
            urlSource: 0,
          },
        ],
        code: 200,
      }
    }

    const getFromNetease = async (
      req: Request
    ): Promise<FetchAudioSourceResponse | undefined> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const getSongUrl = (require('NeteaseCloudMusicApi') as any).song_url

        const result = await getSongUrl({ ...req.query, cookie: req.cookies })

        return result.body
      } catch (error: any) {
        return
      }
    }

    const unmExecutor = new UNM.Executor()
    const getFromUNM = async (id: number, req: Request) => {
      log.debug('[server] Fetching audio url from UNM')
      let track: Track = cache.get(CacheAPIs.Track, { ids: String(id) })
        ?.songs?.[0]
      if (!track) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const getSongDetail = (require('NeteaseCloudMusicApi') as any)
          .song_detail

        track = await getSongDetail({ ...req.query, cookie: req.cookies })
      }
      if (!track) return

      const trackForUNM = {
        id: String(track.id),
        name: track.name,
        duration: track.dt,
        album: {
          id: String(track.al.id),
          name: track.al.name,
        },
        artists: [
          ...track.ar.map((a: Artist) => ({
            id: String(a.id),
            name: a.name,
          })),
        ],
      }

      const sourceList = ['ytdl']
      const context = {}
      const matchedAudio = await unmExecutor.search(
        sourceList,
        trackForUNM,
        context
      )
      const retrievedSong = await unmExecutor.retrieve(matchedAudio, context)
      const source =
        retrievedSong.source === 'ytdl' ? 'youtube' : retrievedSong.source
      if (retrievedSong.url) {
        return {
          data: [
            {
              source,
              id,
              url: retrievedSong.url,
              br: 128000,
              size: 0,
              md5: '',
              code: 200,
              expi: 0,
              type: 'unknown',
              gain: 0,
              fee: 8,
              uf: null,
              payed: 0,
              flag: 4,
              canExtend: false,
              freeTrialInfo: null,
              level: 'standard',
              encodeType: 'unknown',
              freeTrialPrivilege: {
                resConsumable: false,
                userConsumable: false,
                listenType: null,
              },
              freeTimeTrialPrivilege: {
                resConsumable: false,
                userConsumable: false,
                type: 0,
                remainTime: 0,
              },
              urlSource: 0,
              unm: {
                source,
                song: matchedAudio.song,
              },
            },
          ],
          code: 200,
        }
      }
    }

    const handler = async (req: Request, res: Response) => {
      const id = Number(req.query.id) || 0
      if (id === 0) {
        return res.status(400).send({
          code: 400,
          msg: 'id is required or id is invalid',
        })
      }

      // try {
      //   const fromCache = await getFromCache(id)
      //   if (fromCache) {
      //     res.status(200).send(fromCache)
      //     return
      //   }
      // } catch (error) {
      //   log.error(`[server] getFromCache failed: ${String(error)}`)
      // }

      // const fromNetease = await getFromNetease(req)
      // if (fromNetease?.code === 200 && !fromNetease?.data?.[0].freeTrialInfo) {
      //   res.status(200).send(fromNetease)
      //   return
      // }

      try {
        const fromUNM = await getFromUNM(id, req)
        if (fromUNM) {
          res.status(200).send(fromUNM)
          return
        }
      } catch (error) {
        log.error(`[server] getFromNetease failed: ${String(error)}`)
      }

      // if (fromNetease?.data?.[0].freeTrialInfo) {
      //   fromNetease.data[0].url = ''
      // }

      // res.status(fromNetease?.code ?? 500).send(fromNetease)
    }

    this.app.get('/netease/song/url', handler)
  }

  cacheAudioHandler() {
    this.app.get(
      '/yesplaymusic/audio/:filename',
      async (req: Request, res: Response) => {
        cache.getAudio(req.params.filename, res)
      }
    )
    this.app.post(
      '/yesplaymusic/audio/:id',
      async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const { url } = req.query
        if (isNaN(id)) {
          return res.status(400).send({ error: 'Invalid param id' })
        }
        if (!url) {
          return res.status(400).send({ error: 'Invalid query url' })
        }

        if (
          !req.files ||
          Object.keys(req.files).length === 0 ||
          !req.files.file
        ) {
          return res.status(400).send('No audio were uploaded.')
        }
        if ('length' in req.files.file) {
          return res.status(400).send('Only can upload one audio at a time.')
        }

        try {
          await cache.setAudio(req.files.file.data, {
            id,
            url: String(req.query.url) || '',
          })
          res.status(200).send('Audio cached!')
        } catch (error) {
          res.status(500).send({ error })
        }
      }
    )
  }

  listen() {
    this.app.listen(this.port, () => {
      log.info(`[server] API server listening on port ${this.port}`)
    })
  }
}

export default new Server()
