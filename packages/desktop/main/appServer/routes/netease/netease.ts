import log from '@/desktop/main/log'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { pathCase, snakeCase } from 'change-case'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import NeteaseCloudMusicApi from 'NeteaseCloudMusicApi'
import cache from '../../../cache'

async function netease(fastify: FastifyInstance) {
  const getHandler = (name: string, neteaseApi: (params: any) => any) => {
    return async (
      req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      console.log(req.routerPath)
      // Get track details from cache
      if (name === CacheAPIs.Track) {
        const cacheData = await cache.get(name, req.query as any)
        if (cacheData) {
          return cacheData
        }
      }

      // Request netease api
      try {
        const result = await neteaseApi({
          ...req.query,
          cookie: req.cookies,
        })

        cache.set(name as CacheAPIs, result.body, req.query)

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
      ['serveNcmApi', 'getModulesDefinitions', snakeCase(CacheAPIs.SongUrl)].includes(
        nameInSnakeCase
      )
    ) {
      return
    }

    const name = pathCase(nameInSnakeCase)
    const handler = getHandler(name, neteaseApi)

    fastify.get(`/netease/${name}`, handler)
    fastify.post(`/netease/${name}`, handler)
  })

  fastify.get('/netease', () => 'NeteaseCloudMusicApi')
}

export default netease
