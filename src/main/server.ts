import { pathCase } from 'change-case'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import log from './log'
import cache from './cache'
import fileUpload from 'express-fileupload'
import path from 'path'

log.info('[server] starting http server')

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const neteaseApi = require('NeteaseCloudMusicApi') as (params: any) => any[]

const app = express()
app.use(cookieParser())
app.use(fileUpload())

Object.entries(neteaseApi).forEach(([name, handler]) => {
  if (['serveNcmApi', 'getModulesDefinitions'].includes(name)) return

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
    cache.getAudio(req.params.filename, res)
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
    await cache.setAudio(req.files.file.data, {
      id: id,
      source: 'netease',
    })
    res.status(200).send('Audio cached!')
  } catch (error) {
    res.status(500).send({ error })
  }
})

if (isProd) {
  app.use('/', express.static(path.join(__dirname, '../renderer/')))
}

const port = Number(
  isProd
    ? process.env.ELECTRON_WEB_SERVER_PORT ?? 42710
    : process.env.ELECTRON_DEV_NETEASE_API_PORT ?? 3000
)
app.listen(port, () => {
  log.info(`[server] API server listening on port ${port}`)
})
