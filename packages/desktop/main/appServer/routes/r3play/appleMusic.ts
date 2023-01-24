import { FastifyInstance } from 'fastify'
import proxy from '@fastify/http-proxy'

async function appleMusic(fastify: FastifyInstance) {
  fastify.register(proxy, {
    upstream: 'http://168.138.174.244:35530/',
    prefix: '/r3play/apple-music',
    rewritePrefix: '/apple-music',
  })
}

export default appleMusic
