import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'path'
import fastifyCookie from '@fastify/cookie'
import { isProd } from '../env'
import log from '../log'
import netease from './routes/netease'
import appleMusic from './routes/r3play/appleMusic'

const server = fastify({
  ignoreTrailingSlash: true,
})

server.register(fastifyCookie)
if (isProd) {
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../web'),
  })
}

server.register(netease, { prefix: '/netease' })
server.register(appleMusic)

const port = Number(
  isProd
    ? process.env.ELECTRON_WEB_SERVER_PORT || 42710
    : process.env.ELECTRON_DEV_NETEASE_API_PORT || 30001
)
server.listen({ port })

log.info(`[appServer] http server listening on port ${port}`)
