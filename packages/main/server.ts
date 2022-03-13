import { pathCase } from 'change-case'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import logger from './logger'

const neteaseApi = require('NeteaseCloudMusicApi')

const app = express()
app.use(cookieParser())
const port = Number(process.env['ELECTRON_DEV_NETEASE_API_PORT'] ?? 3000)

Object.entries(neteaseApi).forEach(([name, handler]) => {
  if (['serveNcmApi', 'getModulesDefinitions'].includes(name)) {
    return
  }

  const wrappedHandler = async (req: Request, res: Response) => {
    logger.info(`[server] Handling request: ${req.path}`)
    try {
      const result = await handler({
        ...req.query,
        // cookie:
        //   'MUSIC_U=1239b6c1217d8cd240df9c8fa15e99a62f9aaac86baa7a8aa3166acbad267cd8a237494327fc3ec043124f3fcebe94e446b14e3f0c3f8af9fe5c85647582a507',
        // cookie: req.headers.cookie,
        cookie: `MUSIC_U=${req.cookies['MUSIC_U']}`,
      })
      res.send(result.body)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  app.get(
    `/netease/${pathCase(name)}`,
    async (req: Request, res: Response) => await wrappedHandler(req, res)
  )
  app.post(
    `/netease/${pathCase(name)}`,
    async (req: Request, res: Response) => await wrappedHandler(req, res)
  )
})

app.listen(port, () => {
  logger.info(`[server] API server listening on port ${port}`)
})
