import prisma from './prisma'
import { app } from 'electron'
import log from './log'
import fs from 'fs'
import * as musicMetadata from 'music-metadata'
import { CacheAPIs, CacheAPIsParams, CacheAPIsResponse } from '@/shared/CacheAPIs'
import { FastifyReply } from 'fastify'

class Cache {
  constructor() {
    //
  }

  async set<T extends CacheAPIs>(
    api: T,
    data: CacheAPIsResponse[T],
    query: { [key: string]: string } = {}
  ) {
    if (!data) return
    switch (api) {
      case CacheAPIs.UserPlaylist:
      case CacheAPIs.UserAccount:
      case CacheAPIs.Personalized:
      case CacheAPIs.RecommendResource:
      case CacheAPIs.UserAlbums:
      case CacheAPIs.UserArtists:
      case CacheAPIs.ListenedRecords:
      case CacheAPIs.Likelist: {
        const id = api
        const row = { id, json: JSON.stringify(data) }
        await prisma.accountData.upsert({ where: { id }, create: row, update: row })
        break
      }
      case CacheAPIs.Track: {
        const res = data as CacheAPIsResponse[CacheAPIs.Track]
        if (!res.songs) return
        await Promise.all(
          res.songs.map(t => {
            const id = t.id
            const row = { id, json: JSON.stringify(t) }
            return prisma.track.upsert({ where: { id }, create: row, update: row })
          })
        )
        break
      }
      case CacheAPIs.Album: {
        const res = data as CacheAPIsResponse[CacheAPIs.Album]
        if (!res.album) return
        res.album.songs = data.songs
        const id = data.album.id
        const row = { id, json: JSON.stringify(data.album) }
        await prisma.album.upsert({ where: { id }, update: row, create: row })
        break
      }
      case CacheAPIs.Playlist: {
        if (!data.playlist) return
        const id = data.playlist.id
        const row = { id, json: JSON.stringify(data) }
        await prisma.playlist.upsert({ where: { id }, update: row, create: row })
        break
      }
      case CacheAPIs.Artist: {
        if (!data.artist) return
        const id = data.artist.id
        const row = { id, json: JSON.stringify(data) }
        await prisma.artist.upsert({ where: { id }, update: row, create: row })
        break
      }
      case CacheAPIs.ArtistAlbum: {
        const res = data as CacheAPIsResponse[CacheAPIs.ArtistAlbum]
        if (!res.hotAlbums) return

        const id = data.artist.id
        const row = { id, hotAlbums: res.hotAlbums.map(a => a.id).join(',') }
        await prisma.artistAlbum.upsert({ where: { id }, update: row, create: row })
        await Promise.all(
          res.hotAlbums.map(async album => {
            const id = album.id
            const existAlbum = await prisma.album.findUnique({ where: { id } })
            if (!existAlbum) {
              await prisma.album.create({ data: { id, json: JSON.stringify(album) } })
            }
          })
        )
        break
      }
      case CacheAPIs.Lyric: {
        if (!data.lrc) return
        const id = Number(query.id)
        const row = { id, json: JSON.stringify(data) }
        await prisma.lyrics.upsert({ where: { id }, update: row, create: row })
        break
      }
      // case CacheAPIs.CoverColor: {
      //   if (!data.id || !data.color) return
      //   if (/^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$/.test(data.color) === false) {
      //     return
      //   }
      //   db.upsert(Tables.CoverColor, {
      //     id: data.id,
      //     color: data.color,
      //     queriedAt: Date.now(),
      //   })
      //   break
      // }
      case CacheAPIs.AppleMusicAlbum: {
        if (!data.id) return
        const id = data.id
        const row = { id, json: JSON.stringify(data) }
        await prisma.appleMusicAlbum.upsert({ where: { id }, update: row, create: row })
        break
      }
      case CacheAPIs.AppleMusicArtist: {
        if (!data) return
        const id = data.id
        const row = { id, json: JSON.stringify(data) }
        await prisma.artist.upsert({ where: { id }, update: row, create: row })
        break
      }
    }
  }

  async get<T extends CacheAPIs>(
    api: T,
    query: CacheAPIsParams[T]
  ): Promise<CacheAPIsResponse[T] | undefined> {
    switch (api) {
      case CacheAPIs.UserPlaylist:
      case CacheAPIs.UserAccount:
      case CacheAPIs.Personalized:
      case CacheAPIs.RecommendResource:
      case CacheAPIs.UserArtists:
      case CacheAPIs.ListenedRecords:
      case CacheAPIs.Likelist: {
        const data = await prisma.accountData.findUnique({ where: { id: api } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case CacheAPIs.Track: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.Track]
        const ids: number[] = typedQuery?.ids.split(',').map((id: string) => Number(id))
        if (ids.length === 0) return

        if (ids.includes(NaN)) return

        const tracksRaw = await prisma.track.findMany({ where: { id: { in: ids } } })

        if (tracksRaw.length !== ids.length) {
          return
        }
        const tracks = ids.map(id => {
          const track = tracksRaw.find(t => t.id === Number(id)) as any
          return JSON.parse(track.json)
        })
        return {
          code: 200,
          songs: tracks,
          privileges: {},
        }
      }
      case CacheAPIs.Album: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.Album]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.album.findUnique({ where: { id } })
        if (data?.json)
          return {
            resourceState: true,
            songs: [],
            code: 200,
            album: JSON.parse(data.json),
          }
        break
      }
      case CacheAPIs.Playlist: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.Playlist]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.playlist.findUnique({ where: { id } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case CacheAPIs.Artist: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.Artist]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.artist.findUnique({ where: { id } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case CacheAPIs.ArtistAlbum: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.ArtistAlbum]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return

        const artistAlbums = await prisma.artistAlbum.findUnique({ where: { id } })
        if (!artistAlbums?.hotAlbums) return
        const ids = artistAlbums.hotAlbums.split(',').map(Number)

        const albumsRaw = await prisma.album.findMany({
          where: { id: { in: ids } },
        })
        if (albumsRaw.length !== ids.length) return
        const albums = albumsRaw.map(a => JSON.parse(a.json))
        return {
          hotAlbums: ids.map((id: number) => albums.find(a => a.id === id)),
        }
      }
      case CacheAPIs.Lyric: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.Lyric]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.lyrics.findUnique({ where: { id } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case CacheAPIs.CoverColor: {
        // if (isNaN(Number(params?.id))) return
        // return db.find(Tables.CoverColor, params.id)?.color
      }
      case CacheAPIs.AppleMusicAlbum: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.AppleMusicAlbum]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.appleMusicAlbum.findUnique({ where: { id } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case CacheAPIs.AppleMusicArtist: {
        const typedQuery = query as CacheAPIsParams[CacheAPIs.AppleMusicArtist]
        const id = Number(typedQuery?.id)
        if (isNaN(id)) return
        const data = await prisma.appleMusicArtist.findUnique({ where: { id } })
        if (data?.json) return JSON.parse(data.json)
        break
      }
    }
    return
  }

  async getAudio(filename: string, reply: FastifyReply) {
    if (!filename) {
      return reply.status(400).send({ error: 'No filename provided' })
    }
    const id = Number(filename.split('-')[0])

    try {
      const path = `${app.getPath('userData')}/audio_cache/${filename}`
      const audio = fs.readFileSync(path)
      if (audio.byteLength === 0) {
        prisma.audio.delete({ where: { id } })
        fs.unlinkSync(path)
        return reply.status(404).send({ error: 'Audio not found' })
      }
      await prisma.audio.update({ where: { id }, data: { updatedAt: new Date() } })
      reply
        .status(206)
        .header('Accept-Ranges', 'bytes')
        .header('Connection', 'keep-alive')
        .header('Content-Range', `bytes 0-${audio.byteLength - 1}/${audio.byteLength}`)
        .send(audio)
    } catch (error) {
      reply.status(500).send({ error })
    }
  }

  async setAudio(
    buffer: Buffer,
    { id, url, bitrate }: { id: number; url: string; bitrate: number }
  ) {
    const path = `${app.getPath('userData')}/audio_cache`

    try {
      fs.statSync(path)
    } catch (e) {
      fs.mkdirSync(path)
    }

    const meta = await musicMetadata.parseBuffer(buffer)
    const bitRate = ~~((meta.format.bitrate || bitrate || 0) / 1000)
    const format =
      {
        'MPEG 1 Layer 3': 'mp3',
        'Ogg Vorbis': 'ogg',
        AAC: 'm4a',
        FLAC: 'flac',
        OPUS: 'opus',
      }[meta.format.codec ?? ''] ?? 'unknown'

    let source = 'unknown'
    if (url.includes('googlevideo.com')) source = 'youtube'
    if (url.includes('126.net')) source = 'netease'

    fs.writeFile(`${path}/${id}-${bitRate}.${format}`, buffer, async error => {
      if (error) {
        return log.error(`[cache] cacheAudio failed: ${error}`)
      }

      const row = { id, bitRate, format, source }
      await prisma.audio.upsert({
        where: { id },
        create: row,
        update: row,
      })

      log.info(`Audio file ${id}-${bitRate}.${format} cached!`)
    })
  }
}

export default new Cache()
