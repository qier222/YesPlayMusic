import { db, Tables } from './db'
import type { FetchTracksResponse } from '../renderer/api/track'
import { app, ipcMain } from 'electron'
import { Request, Response } from 'express'
import logger from './logger'
import fs from 'fs'
import * as musicMetadata from 'music-metadata'

export async function setCache(api: string, data: any, query: any) {
  switch (api) {
    case 'user/playlist':
    case 'user/account':
    case 'personalized':
    case 'recommend/resource':
    case 'likelist': {
      if (!data) return
      db.upsert(Tables.ACCOUNT_DATA, {
        id: api,
        json: JSON.stringify(data),
        updateAt: Date.now(),
      })
      break
    }
    case 'song/detail': {
      if (!data.songs) return
      const tracks = (data as FetchTracksResponse).songs.map(t => ({
        id: t.id,
        json: JSON.stringify(t),
        updatedAt: Date.now(),
      }))
      db.upsertMany(Tables.TRACK, tracks)
      break
    }
    case 'album': {
      if (!data.album) return
      data.album.songs = data.songs
      db.upsert(Tables.ALBUM, {
        id: data.album.id,
        json: JSON.stringify(data.album),
        updatedAt: Date.now(),
      })
      break
    }
    case 'playlist/detail': {
      if (!data.playlist) return
      db.upsert(Tables.PLAYLIST, {
        id: data.playlist.id,
        json: JSON.stringify(data),
        updatedAt: Date.now(),
      })
      break
    }
    case 'artists': {
      if (!data.artist) return
      db.upsert(Tables.ARTIST, {
        id: data.artist.id,
        json: JSON.stringify(data),
        updatedAt: Date.now(),
      })
      break
    }
    case 'artist/album': {
      if (!data.hotAlbums) return
      db.createMany(
        Tables.ALBUM,
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
      db.upsert(Tables.ARTIST_ALBUMS, {
        id: data.artist.id,
        json: JSON.stringify(modifiedData),
        updatedAt: Date.now(),
      })
      break
    }
  }
}

export function getCache(api: string, query: any): any {
  switch (api) {
    case 'user/account':
    case 'user/playlist':
    case 'personalized':
    case 'recommend/resource':
    case 'likelist': {
      const data = db.find(Tables.ACCOUNT_DATA, api)
      if (data?.json) return JSON.parse(data.json)
      break
    }
    case 'song/detail': {
      const ids: string[] = query?.ids.split(',')
      if (ids.length === 0) return

      let isIDsValid = true
      ids.forEach(id => {
        if (id === '' || isNaN(Number(id))) isIDsValid = false
      })
      if (!isIDsValid) return

      const tracksRaw = db.findMany(Tables.TRACK, ids)

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
    case 'album': {
      if (isNaN(Number(query?.id))) return
      const data = db.find(Tables.ALBUM, query.id)
      if (data?.json)
        return {
          resourceState: true,
          songs: [],
          code: 200,
          album: JSON.parse(data.json),
        }
      break
    }
    case 'playlist/detail': {
      if (isNaN(Number(query?.id))) return
      const data = db.find(Tables.PLAYLIST, query.id)
      if (data?.json) return JSON.parse(data.json)
      break
    }
    case 'artists': {
      if (isNaN(Number(query?.id))) return
      const data = db.find(Tables.ARTIST, query.id)
      if (data?.json) return JSON.parse(data.json)
      break
    }
    case 'artist/album': {
      if (isNaN(Number(query?.id))) return

      const artistAlbumsRaw = db.find(Tables.ARTIST_ALBUMS, query.id)
      if (!artistAlbumsRaw?.json) return
      const artistAlbums = JSON.parse(artistAlbumsRaw.json)

      const albumsRaw = db.findMany(Tables.ALBUM, artistAlbums.hotAlbums)
      if (albumsRaw.length !== artistAlbums.hotAlbums.length) return
      const albums = albumsRaw.map(a => JSON.parse(a.json))

      artistAlbums.hotAlbums = artistAlbums.hotAlbums.map((id: number) =>
        albums.find(a => a.id === id)
      )
      return artistAlbums
    }
  }
}

export async function getCacheForExpress(api: string, req: Request) {
  // Get track detail cache
  if (api === 'song/detail') {
    const cache = getCache(api, req.query)
    if (cache) {
      logger.info(`[cache] Cache hit for ${req.path}`)
      return cache
    }
  }

  // Get audio cache if API is song/detail
  if (api === 'song/url') {
    const cache = db.find(Tables.AUDIO, Number(req.query.id))
    if (!cache) return

    const audioFileName = `${cache.id}-${cache.br}.${cache.type}`

    const isAudioFileExists = fs.existsSync(
      `${app.getPath('userData')}/audio_cache/${audioFileName}`
    )
    if (!isAudioFileExists) return

    logger.info(`[cache] Audio cache hit for ${req.path}`)

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

export function getAudioCache(fileName: string, res: Response) {
  if (!fileName) {
    return res.status(400).send({ error: 'No filename provided' })
  }
  const id = Number(fileName.split('-')[0])

  try {
    const path = `${app.getPath('userData')}/audio_cache/${fileName}`
    const audio = fs.readFileSync(path)
    if (audio.byteLength === 0) {
      db.delete(Tables.AUDIO, id)
      fs.unlinkSync(path)
      return res.status(404).send({ error: 'Audio not found' })
    }
    res.send(audio)
  } catch (error) {
    res.status(500).send({ error })
  }
}

// Cache audio info local folder
export async function cacheAudio(
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
      return logger.error(`[cache] cacheAudio failed: ${error}`)
    }
    logger.info(`Audio file ${id}-${br}.${type} cached!`)

    db.upsert(Tables.AUDIO, {
      id,
      br,
      type,
      source,
      updateAt: Date.now(),
    })

    logger.info(`[cache] cacheAudio ${id}-${br}.${type}`)
  })
}

ipcMain.on('getApiCacheSync', (event, args) => {
  const { api, query } = args
  const data = getCache(api, query)
  event.returnValue = data
})
