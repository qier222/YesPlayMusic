import { FastifyPluginAsync } from 'fastify'
import appleMusicRequest from '../../utils/appleMusicRequest'

type ResponseSchema = {
  status: 'OK' | 'Expired'
}

const album: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/check-token', opts, async function (request, reply): Promise<
    ResponseSchema | undefined
  > {
    const result = await appleMusicRequest({
      method: 'GET',
      url: '/search',
      params: {
        term: `Taylor Swift evermore`,
        types: 'albums',
        'fields[albums]': 'artistName,artwork,name,copyright,editorialVideo,editorialNotes',
        limit: '1',
        l: 'en-us',
      },
    })

    return {
      status: result?.results?.album ? 'OK' : 'Expired',
    }
  })
}

export default album
