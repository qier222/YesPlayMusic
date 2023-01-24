import { FastifyPluginAsync } from 'fastify'
import appleMusicRequest from '../../utils/appleMusicRequest'
import { album as getAlbum } from 'NeteaseCloudMusicApi'

type ResponseSchema = {
  id: number
  neteaseId: number
  name: string
  artistName: string
  editorialVideo: string
  artwork: string
  copyright: string
  neteaseName: string
  neteaseArtistName: string
  editorialNote: {
    en_US: string
    zh_CN: string
  }
}

const album: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: {
      neteaseId: string
      lang?: 'zh-CN' | 'en-US'
    }
  }>('/album', opts, async function (request, reply): Promise<ResponseSchema | undefined> {
    const { neteaseId: neteaseIdString, lang = 'en-US' } = request.query

    // validate neteaseAlbumID
    const neteaseId = Number(neteaseIdString)
    if (isNaN(neteaseId)) {
      reply.code(400).send('params "neteaseId" is required')
      return
    }

    // get from database
    const fromDB = await fastify.prisma.album.findFirst({
      where: { neteaseId: neteaseId },
      include: { editorialNote: { select: { en_US: true, zh_CN: true } } },
    })
    if (fromDB) {
      return fromDB as ResponseSchema
    }

    // get from netease
    const { body: neteaseAlbum } = (await getAlbum({ id: neteaseId })) as any
    const artist = neteaseAlbum?.album?.artist?.name
    const albumName = neteaseAlbum?.album?.name
    if (!artist || !albumName) {
      return
    }

    // get from apple
    const fromApple = await appleMusicRequest({
      method: 'GET',
      url: '/search',
      params: {
        term: `${artist} ${albumName}`,
        types: 'albums',
        'fields[albums]': 'artistName,artwork,name,copyright,editorialVideo,editorialNotes',
        limit: '10',
        l: lang.toLowerCase(),
      },
    })

    const albums = fromApple?.results?.album?.data
    const album =
      albums?.find(
        (a: any) =>
          a.attributes.name.toLowerCase() === albumName.toLowerCase() &&
          a.attributes.artistName.toLowerCase() === artist.toLowerCase()
      ) || albums?.[0]
    if (!album) return

    // get editorialNote
    const editorialNote = {
      en_US: lang === 'en-US' ? album.attributes.editorialNotes?.standard : '',
      zh_CN: lang === 'zh-CN' ? album.attributes.editorialNotes?.standard : '',
    }
    const otherLangEditorialNoteResult = await appleMusicRequest({
      method: 'GET',
      url: `/albums/${album.id}`,
      params: {
        'fields[albums]': 'editorialNotes',
        'omit[resource:albums]': 'relationships',
        l: lang === 'zh-CN' ? 'en-US' : 'zh-CN',
      },
    })
    const otherLangEditorialNote =
      otherLangEditorialNoteResult?.data?.[0]?.attributes?.editorialNotes?.standard
    if (lang === 'zh-CN') {
      editorialNote.en_US = otherLangEditorialNote
    } else if (lang === 'en-US') {
      editorialNote.zh_CN = otherLangEditorialNote
    }

    const data: ResponseSchema = {
      id: Number(album.id),
      neteaseId: Number(neteaseId),
      name: album.attributes.name,
      artistName: album.attributes.artistName,
      editorialVideo: album.attributes.editorialVideo?.motionDetailSquare?.video,
      artwork: album.attributes.artwork?.url,
      editorialNote,
      copyright: album.attributes.copyright,
      neteaseName: albumName,
      neteaseArtistName: artist,
    }
    reply.send(data)

    // save to database
    await fastify.prisma.album
      .create({
        data: {
          ...data,
          editorialNote: { create: editorialNote },
        },
      })
      .catch(e => console.error(e))

    return
  })
}

export default album
