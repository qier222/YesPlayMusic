import { FastifyPluginAsync } from 'fastify'
import appleMusicRequest from '../../utils/appleMusicRequest'

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: {
      name: string
      lang: 'zh-CN' | 'en-US'
    }
  }>('/artist', async function (request, reply) {
    const { name, lang } = request.query

    if (!name) {
      return {
        code: 400,
        message: 'params "name" is required',
      }
    }

    const fromApple = await appleMusicRequest({
      method: 'GET',
      url: '/search',
      params: {
        term: name,
        types: 'artists',
        'fields[artists]': 'url,name,artwork,editorialVideo,artistBio',
        'omit[resource:artists]': 'relationships',
        platform: 'web',
        limit: '1',
        l: lang?.toLowerCase() || 'en-us',
        with: 'serverBubbles',
      },
    })

    const artist = fromApple?.results?.artist?.data?.[0]

    if (
      artist &&
      artist?.attributes?.name?.toLowerCase() === name.toLowerCase()
    ) {
      return artist
    }
  })
}

export default example
