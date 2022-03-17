import { pathCase } from 'change-case'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import logger from './logger'
import { getCache, setCache } from './database'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const neteaseApi = require('NeteaseCloudMusicApi') as (params: any) => any[]

const app = express()
app.use(cookieParser())
const port = Number(process.env['ELECTRON_DEV_NETEASE_API_PORT'] ?? 3000)

Object.entries(neteaseApi).forEach(([name, handler]) => {
  if (['serveNcmApi', 'getModulesDefinitions'].includes(name)) return

  const wrappedHandler = async (req: Request, res: Response) => {
    logger.info(`[server] Handling request: ${req.path}`)

    // Get from cache
    const cacheResult = getCache(name, req.query)
    if (cacheResult) {
      logger.info(`[server] Cache hit for ${req.path}`)
      return res.json(cacheResult)
    }

    // Request netease api
    try {
      const result = await handler({
        ...req.query,
        cookie: `MUSIC_U=${req.cookies['MUSIC_U']}`,
      })
      res.send(result.body)
      setCache(name, result.body)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  const neteasePath = `/netease/${pathCase(name)}`
  app.get(neteasePath, wrappedHandler)
  app.post(neteasePath, wrappedHandler)
})

app.listen(port, () => {
  logger.info(`[server] API server listening on port ${port}`)
})
