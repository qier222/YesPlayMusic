import { APIs } from '@/shared/CacheAPIs'
import { pathCase, snakeCase } from 'change-case'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import NeteaseCloudMusicApi from 'NeteaseCloudMusicApi'
import cache from '../../cache'

async function netease(fastify: FastifyInstance) {
  const getHandler = (name: string, neteaseApi: (params: any) => any) => {
    return async (
      req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      // Get track details from cache
      if (name === APIs.Track) {
        const cacheData = cache.get(name, req.query)
        if (cacheData) {
          return cache
        }
      }

      // Request netease api
      try {
        const result = await neteaseApi({
          ...req.query,
          cookie: req.cookies,
        })

        cache.set(name, result.body, req.query)
        return reply.send(result.body)
      } catch (error: any) {
        if ([400, 301].includes(error.status)) {
          return reply.status(error.status).send(error.body)
        }
        return reply.status(500)
      }
    }
  }

  // 循环注册NeteaseCloudMusicApi所有接口
  Object.entries(NeteaseCloudMusicApi).forEach(([nameInSnakeCase, neteaseApi]: [string, any]) => {
    // 例外
    if (
      ['serveNcmApi', 'getModulesDefinitions', snakeCase(APIs.SongUrl)].includes(nameInSnakeCase)
    ) {
      return
    }

    const name = pathCase(nameInSnakeCase)
    const handler = getHandler(name, neteaseApi)

    fastify.get(`/${name}`, handler)
    fastify.post(`/${name}`, handler)
  })

  fastify.get('/', () => 'NeteaseCloudMusicApi')
}

export default netease
