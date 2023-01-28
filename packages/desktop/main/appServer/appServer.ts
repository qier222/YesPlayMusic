import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
import path from 'path'
import { isProd } from '../env'
import log from '../log'
import netease from './routes/netease/netease'
import appleMusic from './routes/r3play/appleMusic'
import audio from './routes/r3play/audio'

const server = fastify({
  ignoreTrailingSlash: true,
})

server.register(fastifyCookie)
server.register(fastifyMultipart)
if (isProd) {
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../web'),
  })
}

server.register(netease)
server.register(audio)
server.register(appleMusic)

const port = Number(
  isProd
    ? process.env.ELECTRON_WEB_SERVER_PORT || 42710
    : process.env.ELECTRON_DEV_NETEASE_API_PORT || 30001
)
server.listen({ port })

log.info(`[appServer] http server listening on port ${port}`)
