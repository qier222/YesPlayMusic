import { pathCase } from 'change-case'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import logger from './logger'
// import {
//   setCache,
//   getCacheForExpress,
//   cacheAudio,
//   getAudioCache,
// } from './cache'
import fileUpload from 'express-fileupload'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const neteaseApi = require('NeteaseCloudMusicApi') as (params: any) => any[]

const app = express()
app.use(cookieParser())
app.use(fileUpload())

Object.entries(neteaseApi).forEach(([name, handler]) => {
  if (['serveNcmApi', 'getModulesDefinitions'].includes(name)) return

  name = pathCase(name)

  const wrappedHandler = async (req: Request, res: Response) => {
    logger.info(`[server] Handling request: ${req.path}`)

    // Get from cache
    // const cache = await getCacheForExpress(name, req)
    // if (cache) return res.json(cache)

    // Request netease api
    try {
      const result = await handler({
        ...req.query,
        cookie: `MUSIC_U=${req.cookies['MUSIC_U']}`,
      })

      // setCache(name, result.body, req.query)
      return res.send(result.body)
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  app.get(`/netease/${name}`, wrappedHandler)
  app.post(`/netease/${name}`, wrappedHandler)
})

// Cache audio
app.get(
  '/yesplaymusic/audio/:filename',
  async (req: Request, res: Response) => {
    // getAudioCache(req.params.filename, res)
  }
)
app.post('/yesplaymusic/audio/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { url } = req.query
  if (isNaN(id)) {
    return res.status(400).send({ error: 'Invalid param id' })
  }
  if (!url) {
    return res.status(400).send({ error: 'Invalid query url' })
  }

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
    return res.status(400).send('No audio were uploaded.')
  }
  if ('length' in req.files.file) {
    return res.status(400).send('Only can upload one audio at a time.')
  }

  try {
    // await cacheAudio(req.files.file.data, {
    //   id: id,
    //   source: 'netease',
    // })
    res.status(200).send('Audio cached!')
  } catch (error) {
    res.status(500).send({ error })
  }
})

const port = Number(process.env.ELECTRON_DEV_NETEASE_API_PORT ?? 3000)
app.listen(port, () => {
  logger.info(`[server] API server listening on port ${port}`)
})
