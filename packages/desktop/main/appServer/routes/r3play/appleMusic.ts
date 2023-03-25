import { FastifyInstance } from 'fastify'
import proxy from '@fastify/http-proxy'
import { isDev } from '@/desktop/main/env'
import log from '@/desktop/main/log'

log.info('[electron] appServer/routes/r3play/appleMusic.ts')

async function appleMusic(fastify: FastifyInstance) {
  fastify.register(proxy, {
    upstream: isDev ? 'http://127.0.0.1:35530/' : 'http://168.138.174.244:35530/',
    prefix: '/r3play/apple-music',
    rewritePrefix: '/apple-music',
  })
}

export default appleMusic
