import db from './surrealdb'
import type { FetchTracksResponse } from '@/shared/api/Track'
import { app } from 'electron'
import { Request, Response } from 'express'
import log from './log'
import fs from 'fs'
import * as musicMetadata from 'music-metadata'
import { APIs, APIsParams } from '@/shared/CacheAPIs'
// import { TablesStructures } from './db'

class Cache {
  constructor() {
    //
  }

  async set(api: string, data: any, query: any = {}) {
    switch (api) {
      case APIs.UserPlaylist:
      case APIs.UserAccount:
      case APIs.Personalized:
      case APIs.RecommendResource:
      case APIs.UserAlbums:
      case APIs.UserArtists:
      case APIs.ListenedRecords:
      case APIs.Likelist: {
        if (!data) return
        db.upsert('netease', 'accountData', api, {
          json: JSON.stringify(data),
        })
        break
      }
      case APIs.Track: {
        const res = data as FetchTracksResponse
        if (!res.songs) return
        const tracks = res.songs.map(t => ({
          key: t.id,
          data: {
            json: JSON.stringify(t),
          },
        }))
        db.upsertMany('netease', 'track', tracks)
        break
      }
      case APIs.Album: {
        if (!data.album) return
        data.album.songs = data.song
        db.upsert('netease', 'album', data.album.id, data.album)
        break
      }
      case APIs.Playlist: {
        if (!data.playlist) return
        db.upsert('netease', 'playlist', data.playlist.id, {
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.Artist: {
        if (!data.artist) return
        db.upsert('netease', 'artist', data.artist.id, {
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.ArtistAlbum: {
        if (!data.hotAlbums) return
        db.upsertMany(
          'netease',
          'album',
          data.hotAlbums.map((a: Album) => ({
            key: a.id,
            data: {
              json: JSON.stringify(a),
              updatedAt: Date.now(),
            },
          }))
        )
        const modifiedData = {
          ...data,
          hotAlbums: data.hotAlbums.map((a: Album) => a.id),
        }
        db.upsert('netease', 'artistAlbums', data.artist.id, {
          json: JSON.stringify(modifiedData),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.Lyric: {
        if (!data.lrc) return
        db.upsert('netease', 'lyric', query.id, {
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      // case APIs.CoverColor: {
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
      case APIs.AppleMusicAlbum: {
        if (!data.id) return
        db.upsert('appleMusic', 'album', data.id, {
          json: data.album ? JSON.stringify(data.album) : 'no',
          // updatedAt: Date.now(),
        })
        break
      }
      case APIs.AppleMusicArtist: {
        if (!data) return
        db.upsert('appleMusic', 'artist', data.id, {
          json: data.artist ? JSON.stringify(data.artist) : 'no',
          // updatedAt: Date.now(),
        })
        break
      }
    }
  }

  async get<T extends keyof APIsParams>(api: T, params: any): Promise<any> {
    switch (api) {
      case APIs.UserPlaylist:
      case APIs.UserAccount:
      case APIs.Personalized:
      case APIs.RecommendResource:
      case APIs.UserArtists:
      case APIs.ListenedRecords:
      case APIs.Likelist: {
        const data = await db.find('netease', 'accountData', api)
        if (!data?.[0]?.json) return
        return JSON.parse(data[0].json)
      }
      case APIs.Track: {
        const ids: number[] = params?.ids
          .split(',')
          .map((id: string) => Number(id))
        if (ids.length === 0) return

        if (ids.includes(NaN)) return

        const tracksRaw = await db.findMany('netease', 'track', ids)

        if (!tracksRaw || tracksRaw.length !== ids.length) {
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
      case APIs.Album: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('netease', 'album', params.id)
        const json = data?.[0]?.json
        if (!json) return
        return {
          resourceState: true,
          songs: [],
          code: 200,
          album: JSON.parse(json),
        }
      }
      case APIs.Playlist: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('netease', 'playlist', params.id)
        if (!data?.[0]?.json) return
        return JSON.parse(data[0].json)
      }
      case APIs.Artist: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('netease', 'artist', params.id)
        const fromAppleData = await db.find('appleMusic', 'artist', params.id)
        const fromApple = fromAppleData?.json && JSON.parse(fromAppleData.json)
        const fromNetease = data?.json && JSON.parse(data.json)
        if (fromNetease && fromApple && fromApple !== 'no') {
          fromNetease.artist.img1v1Url = fromApple.attributes.artwork.url
          fromNetease.artist.briefDesc = fromApple.attributes.artistBio
        }
        return fromNetease || undefined
      }
      case APIs.ArtistAlbum: {
        if (isNaN(Number(params?.id))) return

        const artistAlbumsRaw = await db.find(
          'netease',
          'artistAlbums',
          params.id
        )
        if (!artistAlbumsRaw?.json) return
        const artistAlbums = JSON.parse(artistAlbumsRaw.json)

        const albumsRaw = await db.findMany(
          'netease',
          'album',
          artistAlbums.hotAlbums
        )
        if (albumsRaw?.length !== artistAlbums.hotAlbums.length) return
        const albums = albumsRaw.map(a => JSON.parse(a.json))

        artistAlbums.hotAlbums = artistAlbums.hotAlbums.map((id: number) =>
          albums.find(a => a.id === id)
        )
        return artistAlbums
      }
      case APIs.Lyric: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('netease', 'lyric', params.id)
        if (data?.json) return JSON.parse(data.json)
        return
      }
      // case APIs.CoverColor: {
      //   if (isNaN(Number(params?.id))) return
      //   return await db.find(Tables.CoverColor, params.id)?.color
      // }
      case APIs.Artists: {
        if (!params.ids?.length) return
        const artists = await db.findMany('netease', 'artist', params.ids)
        if (artists?.length !== params.ids.length) return
        const result = artists?.map(a => JSON.parse(a.json))
        result?.sort((a, b) => {
          const indexA: number = params.ids.indexOf(a.artist.id)
          const indexB: number = params.ids.indexOf(b.artist.id)
          return indexA - indexB
        })
        return result
      }
      case APIs.AppleMusicAlbum: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('appleMusic', 'album', params.id)
        if (data?.json && data.json !== 'no') return JSON.parse(data.json)
        return
      }
      case APIs.AppleMusicArtist: {
        if (isNaN(Number(params?.id))) return
        const data = await db.find('appleMusic', 'artist', params.id)
        if (data?.json && data.json !== 'no') return JSON.parse(data.json)
        return
      }
    }
  }

  getForExpress(api: string, req: Request) {
    // Get track detail cache
    if (api === APIs.Track) {
      const cache = this.get(api, req.query)
      if (cache) {
        log.debug(`[cache] Cache hit for ${req.path}`)
        return cache
      }
    }
  }

  getAudio(fileName: string, res: Response) {
    if (!fileName) {
      return res.status(400).send({ error: 'No filename provided' })
    }
    const id = Number(fileName.split('-')[0])

    try {
      const path = `${app.getPath('userData')}/audio_cache/${fileName}`
      const audio = fs.readFileSync(path)
      // if audio file is empty, delete it
      if (audio.byteLength === 0) {
        db.delete('netease', 'audio', id)
        fs.unlinkSync(path)
        return res.status(404).send({ error: 'Audio not found' })
      }
      res
        .status(206)
        .setHeader('Accept-Ranges', 'bytes')
        .setHeader('Connection', 'keep-alive')
        .setHeader(
          'Content-Range',
          `bytes 0-${audio.byteLength - 1}/${audio.byteLength}`
        )
        .send(audio)
    } catch (error) {
      res.status(500).send({ error })
    }
  }

  async setAudio(buffer: Buffer, { id, url }: { id: number; url: string }) {
    const path = `${app.getPath('userData')}/audio_cache`

    try {
      fs.statSync(path)
    } catch (e) {
      fs.mkdirSync(path)
    }

    const meta = await musicMetadata.parseBuffer(buffer)
    const br =
      meta?.format?.codec === 'OPUS' ? 165000 : meta.format.bitrate ?? 0
    const type =
      {
        'MPEG 1 Layer 3': 'mp3',
        'Ogg Vorbis': 'ogg',
        AAC: 'm4a',
        FLAC: 'flac',
        OPUS: 'opus',
      }[meta.format.codec ?? ''] ?? 'unknown'

    // let source: TablesStructures[Tables.Audio]['source'] = 'unknown'
    let source = 'unknown'
    if (url.includes('googlevideo.com')) source = 'youtube'
    if (url.includes('126.net')) source = 'netease'
    if (url.includes('migu.cn')) source = 'migu'
    if (url.includes('kuwo.cn')) source = 'kuwo'
    if (url.includes('bilivideo.com')) source = 'bilibili'
    // TODO: missing kugou qq joox

    fs.writeFile(`${path}/${id}-${br}.${type}`, buffer, error => {
      if (error) {
        return log.error(`[cache] cacheAudio failed: ${error}`)
      }
      log.info(`Audio file ${id}-${br}.${type} cached!`)

      db.upsert('netease', 'audio', id, {
        id,
        br,
        type,
        source,
        queriedAt: Date.now(),
      })

      log.info(`[cache] cacheAudio ${id}-${br}.${type}`)
    })
  }
}

export default new Cache()
