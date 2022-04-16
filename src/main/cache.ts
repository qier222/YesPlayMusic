import { db, Tables } from './db'
import type { FetchTracksResponse } from '../renderer/api/track'
import { app } from 'electron'
import { Request, Response } from 'express'
import log from './log'
import fs from 'fs'
import * as musicMetadata from 'music-metadata'
import { APIs } from './CacheAPIsName'

class Cache {
  constructor() {
    //
  }

  set(api: string, data: any, query: any = {}) {
    switch (api) {
      case APIs.UserPlaylist:
      case APIs.UserAccount:
      case APIs.Personalized:
      case APIs.RecommendResource:
      case APIs.Likelist: {
        if (!data) return
        db.upsert(Tables.AccountData, {
          id: api,
          json: JSON.stringify(data),
          updateAt: Date.now(),
        })
        break
      }
      case APIs.SongDetail: {
        if (!data.songs) return
        const tracks = (data as FetchTracksResponse).songs.map(t => ({
          id: t.id,
          json: JSON.stringify(t),
          updatedAt: Date.now(),
        }))
        db.upsertMany(Tables.Track, tracks)
        break
      }
      case APIs.Album: {
        if (!data.album) return
        data.album.songs = data.songs
        db.upsert(Tables.Album, {
          id: data.album.id,
          json: JSON.stringify(data.album),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.PlaylistDetail: {
        if (!data.playlist) return
        db.upsert(Tables.Playlist, {
          id: data.playlist.id,
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.Artists: {
        if (!data.artist) return
        db.upsert(Tables.Artist, {
          id: data.artist.id,
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.ArtistAlbum: {
        if (!data.hotAlbums) return
        db.createMany(
          Tables.Album,
          data.hotAlbums.map((a: Album) => ({
            id: a.id,
            json: JSON.stringify(a),
            updatedAt: Date.now(),
          }))
        )
        const modifiedData = {
          ...data,
          hotAlbums: data.hotAlbums.map((a: Album) => a.id),
        }
        db.upsert(Tables.ArtistAlbum, {
          id: data.artist.id,
          json: JSON.stringify(modifiedData),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.Lyric: {
        if (!data.lrc) return
        db.upsert(Tables.Lyric, {
          id: query.id,
          json: JSON.stringify(data),
          updatedAt: Date.now(),
        })
        break
      }
      case APIs.CoverColor: {
        if (!data.id || !data.color) return
        if (/^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$/.test(data.color) === false) {
          return
        }
        db.upsert(Tables.CoverColor, {
          id: data.id,
          color: data.color,
        })
      }
    }
  }

  get(api: string, query: any): any {
    switch (api) {
      case APIs.UserPlaylist:
      case APIs.UserAccount:
      case APIs.Personalized:
      case APIs.RecommendResource:
      case APIs.Likelist: {
        const data = db.find(Tables.AccountData, api)
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case APIs.SongDetail: {
        const ids: string[] = query?.ids.split(',')
        if (ids.length === 0) return

        let isIDsValid = true
        ids.forEach(id => {
          if (id === '' || isNaN(Number(id))) isIDsValid = false
        })
        if (!isIDsValid) return

        const tracksRaw = db.findMany(Tables.Track, ids)

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
      case APIs.Album: {
        if (isNaN(Number(query?.id))) return
        const data = db.find(Tables.Album, query.id)
        if (data?.json)
          return {
            resourceState: true,
            songs: [],
            code: 200,
            album: JSON.parse(data.json),
          }
        break
      }
      case APIs.PlaylistDetail: {
        if (isNaN(Number(query?.id))) return
        const data = db.find(Tables.Playlist, query.id)
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case APIs.Artists: {
        if (isNaN(Number(query?.id))) return
        const data = db.find(Tables.Artist, query.id)
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case APIs.ArtistAlbum: {
        if (isNaN(Number(query?.id))) return

        const artistAlbumsRaw = db.find(Tables.ArtistAlbum, query.id)
        if (!artistAlbumsRaw?.json) return
        const artistAlbums = JSON.parse(artistAlbumsRaw.json)

        const albumsRaw = db.findMany(Tables.Album, artistAlbums.hotAlbums)
        if (albumsRaw.length !== artistAlbums.hotAlbums.length) return
        const albums = albumsRaw.map(a => JSON.parse(a.json))

        artistAlbums.hotAlbums = artistAlbums.hotAlbums.map((id: number) =>
          albums.find(a => a.id === id)
        )
        return artistAlbums
      }
      case APIs.Lyric: {
        if (isNaN(Number(query?.id))) return
        const data = db.find(Tables.Lyric, query.id)
        if (data?.json) return JSON.parse(data.json)
        break
      }
      case APIs.CoverColor: {
        if (isNaN(Number(query?.id))) return
        return db.find(Tables.CoverColor, query.id)?.color
      }
    }
  }

  getForExpress(api: string, req: Request) {
    // Get track detail cache
    if (api === APIs.SongDetail) {
      const cache = this.get(api, req.query)
      if (cache) {
        log.debug(`[cache] Cache hit for ${req.path}`)
        return cache
      }
    }

    // Get audio cache if API is song/detail
    if (api === APIs.SongUrl) {
      const cache = db.find(Tables.Audio, Number(req.query.id))
      if (!cache) return

      const audioFileName = `${cache.id}-${cache.br}.${cache.type}`

      const isAudioFileExists = fs.existsSync(
        `${app.getPath('userData')}/audio_cache/${audioFileName}`
      )
      if (!isAudioFileExists) return

      log.debug(`[cache] Audio cache hit for ${req.path}`)

      return {
        data: [
          {
            source: cache.source,
            id: cache.id,
            url: `http://127.0.0.1:42710/yesplaymusic/audio/${audioFileName}`,
            br: cache.br,
            size: 0,
            md5: '',
            code: 200,
            expi: 0,
            type: cache.type,
            gain: 0,
            fee: 8,
            uf: null,
            payed: 0,
            flag: 4,
            canExtend: false,
            freeTrialInfo: null,
            level: 'standard',
            encodeType: cache.type,
            freeTrialPrivilege: {
              resConsumable: false,
              userConsumable: false,
              listenType: null,
            },
            freeTimeTrialPrivilege: {
              resConsumable: false,
              userConsumable: false,
              type: 0,
              remainTime: 0,
            },
            urlSource: 0,
          },
        ],
        code: 200,
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
      if (audio.byteLength === 0) {
        db.delete(Tables.Audio, id)
        fs.unlinkSync(path)
        return res.status(404).send({ error: 'Audio not found' })
      }
      res.send(audio)
    } catch (error) {
      res.status(500).send({ error })
    }
  }

  async setAudio(
    buffer: Buffer,
    { id, source }: { id: number; source: string }
  ) {
    const path = `${app.getPath('userData')}/audio_cache`

    try {
      fs.statSync(path)
    } catch (e) {
      fs.mkdirSync(path)
    }

    const meta = await musicMetadata.parseBuffer(buffer)
    const br = meta.format.bitrate
    const type = {
      'MPEG 1 Layer 3': 'mp3',
      'Ogg Vorbis': 'ogg',
      AAC: 'm4a',
      FLAC: 'flac',
      unknown: 'unknown',
    }[meta.format.codec ?? 'unknown']

    await fs.writeFile(`${path}/${id}-${br}.${type}`, buffer, error => {
      if (error) {
        return log.error(`[cache] cacheAudio failed: ${error}`)
      }
      log.info(`Audio file ${id}-${br}.${type} cached!`)

      db.upsert(Tables.Audio, {
        id,
        br,
        type,
        source,
        updateAt: Date.now(),
      })

      log.info(`[cache] cacheAudio ${id}-${br}.${type}`)
    })
  }
}

export default new Cache()
