import { FastifyPluginAsync } from 'fastify'
import appleMusicRequest from '../../utils/appleMusicRequest'
import { artist_detail as getArtistDetail } from 'NeteaseCloudMusicApi'

type ResponseSchema = {
  id: number
  neteaseId: number
  editorialVideo: string
  artwork: string
  name: string
  artistBio: {
    en_US: string
    zh_CN: string
  }
}

const artist: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: {
      neteaseId: string
      lang?: 'zh-CN' | 'en-US'
      noCache?: boolean
    }
  }>('/artist', async function (request, reply): Promise<ResponseSchema | undefined> {
    const { neteaseId: neteaseIdString, lang = 'en-US', noCache = false } = request.query

    // validate neteaseId
    const neteaseId = Number(neteaseIdString)
    if (isNaN(neteaseId)) {
      reply.code(400).send('params "neteaseId" is required')
      return
    }

    // get from database
    if (!noCache) {
      const fromDB = await fastify.prisma.artist.findFirst({
        where: { neteaseId: neteaseId },
        include: { artistBio: { select: { en_US: true, zh_CN: true } } },
      })
      if (fromDB) {
        return fromDB as ResponseSchema
      }
    }

    // get from netease
    const { body: neteaseArtist } = (await getArtistDetail({ id: neteaseId })) as any
    const artistName = neteaseArtist?.data?.artist?.name
    if (!artistName) {
      return
    }

    const fromApple = await appleMusicRequest({
      method: 'GET',
      url: '/search',
      params: {
        term: artistName,
        types: 'artists',
        'fields[artists]': 'url,name,artwork,editorialVideo,artistBio',
        'omit[resource:artists]': 'relationships',
        platform: 'web',
        limit: '5',
        l: lang?.toLowerCase(),
      },
    })

    const artist = fromApple?.results?.artist?.data?.[0]
    if (artist?.attributes?.name?.toLowerCase() !== artistName.toLowerCase()) {
      return
    }

    // get ArtistBio
    const artistBio = {
      en_US: lang === 'en-US' ? artist.attributes.artistBio : '',
      zh_CN: lang === 'zh-CN' ? artist.attributes.artistBio : '',
    }
    const otherLangArtistBioResult = await appleMusicRequest({
      method: 'GET',
      url: `/artists/${artist.id}`,
      params: {
        'fields[artists]': 'artistBio',
        'omit[resource:artists]': 'relationships',
        l: lang === 'zh-CN' ? 'en-US' : 'zh-CN',
      },
    })
    const otherLangArtistBio = otherLangArtistBioResult?.data?.[0]?.attributes?.artistBio
    if (lang === 'zh-CN') {
      artistBio.en_US = otherLangArtistBio
    } else if (lang === 'en-US') {
      artistBio.zh_CN = otherLangArtistBio
    }

    const data: ResponseSchema = {
      id: Number(artist.id),
      neteaseId: neteaseId,
      name: artist.attributes.name,
      artistBio,
      editorialVideo: artist?.attributes.editorialVideo?.motionArtistSquare1x1?.video,
      artwork: artist?.attributes?.artwork?.url,
    }

    // save to database
    if (!noCache) {
      await fastify.prisma.artist.create({
        data: {
          ...data,
          artistBio: {
            connectOrCreate: {
              where: { id: data.id },
              create: artistBio,
            },
          },
        },
      })
    }

    return data
  })
}

export default artist
