import { FastifyPluginAsync } from 'fastify'
import appleMusicRequest from '../../utils/appleMusicRequest'

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: {
      name: string
      artist: string
      lang: 'zh-CN' | 'en-US'
    }
  }>('/album', async function (request, reply) {
    const { name, lang, artist } = request.query

    const fromApple = await appleMusicRequest({
      method: 'GET',
      url: '/search',
      params: {
        term: name,
        types: 'albums',
        'fields[albums]': 'artistName,name,editorialVideo,editorialNotes',
        limit: '1',
        l: lang.toLowerCase(),
      },
    })

    const albums = fromApple?.results?.album?.data
    const album =
      albums?.find(
        (a: any) =>
          a.attributes.name.toLowerCase() === name.toLowerCase() &&
          a.attributes.artistName.toLowerCase() === artist.toLowerCase()
      ) || albums?.[0]

    return album
  })
}

export default example
