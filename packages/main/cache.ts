import { db, ModelNames, realm } from './database'
import type { FetchTracksResponse } from '../renderer/src/api/track'
import { app, ipcMain } from 'electron'
import { Request, Response } from 'express'
import logger from './logger'
import fs from 'fs'
import * as musicMetadata from 'music-metadata'

export async function setCache(api: string, data: any, query: any) {
  switch (api) {
    case 'user/account':
    case 'personalized':
    case 'likelist': {
      if (!data) return
      db.set(ModelNames.ACCOUNT_DATA, api, data)
      break
    }
    case 'user/playlist': {
      if (!data.playlist) return
      db.set(ModelNames.USER_PLAYLISTS, Number(query.uid), data)
      break
    }
    case 'song/detail': {
      if (!data.songs) return
      const tracks = (data as FetchTracksResponse).songs
      db.batchSet(
        ModelNames.TRACK,
        tracks.map(t => ({
          id: t.id,
          json: JSON.stringify(t),
          updateAt: Date.now(),
        }))
      )
      break
    }
    case 'album': {
      if (!data.album) return
      data.album.songs = (data as FetchTracksResponse).songs
      db.set(ModelNames.ALBUM, Number(data.album.id), data)
      break
    }
    case 'playlist/detail': {
      if (!data.playlist) return
      db.set(ModelNames.PLAYLIST, Number(data.playlist.id), data)
      break
    }
    case 'artists': {
      if (!data.artist) return
      db.set(ModelNames.ARTIST, Number(data.artist.id), data)
      break
    }
    case 'artist/album': {
      if (!data.hotAlbums) return
      db.set(ModelNames.ARTIST_ALBUMS, Number(data.artist.id), data)
      break
    }
  }
}

/**
 * Check if the cache is expired
 * @param updateAt  from database, milliseconds
 * @param staleTime minutes
 */
const isCacheExpired = (updateAt: number, staleTime: number) => {
  return Date.now() - updateAt > staleTime * 1000 * 60
}

export function getCache(
  api: string,
  query: any,
  checkIsExpired: boolean = false
): any {
  switch (api) {
    case 'user/account':
    case 'personalized':
    case 'likelist': {
      const data = db.get(ModelNames.ACCOUNT_DATA, api) as any
      if (data?.json) return JSON.parse(data.json)
      break
    }
    case 'user/playlist': {
      if (!query.uid) return
      const userPlaylists = db.get(
        ModelNames.USER_PLAYLISTS,
        Number(query?.uid)
      ) as any
      if (userPlaylists?.json) return JSON.parse(userPlaylists.json)
      break
    }
    case 'song/detail': {
      const ids: string[] = query?.ids.split(',')
      const idsQuery = ids.map(id => `id = ${id}`).join(' OR ')
      const tracksRaw = realm
        .objects(ModelNames.TRACK)
        .filtered(`(${idsQuery})`)
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
      if (!query?.id) return
      const album = db.get(ModelNames.ALBUM, Number(query?.id)) as any
      if (checkIsExpired && isCacheExpired(album?.updateAt, 24 * 60)) return
      if (album?.json) return JSON.parse(album.json)
      break
    }
    case 'playlist/detail': {
      if (!query?.id) return
      const playlist = db.get(ModelNames.PLAYLIST, Number(query?.id)) as any
      if (checkIsExpired && isCacheExpired(playlist?.updateAt, 10)) return
      if (playlist?.json) return JSON.parse(playlist.json)
      break
    }
    case 'artists': {
      if (!query?.id) return
      const artist = db.get(ModelNames.ARTIST, Number(query?.id)) as any
      if (checkIsExpired && isCacheExpired(artist?.updateAt, 30)) return
      if (artist?.json) return JSON.parse(artist.json)
      break
    }
    case 'artist/album': {
      if (!query?.id) return
      const artistAlbums = db.get(
        ModelNames.ARTIST_ALBUMS,
        Number(query?.id)
      ) as any
      if (checkIsExpired && isCacheExpired(artistAlbums?.updateAt, 30)) return
      if (artistAlbums?.json) return JSON.parse(artistAlbums.json)
      break
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
    const cache = db.get(ModelNames.AUDIO, Number(req.query.id)) as any
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
      db.delete(ModelNames.AUDIO, Number(id))
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

    realm.write(() => {
      realm.create(
        ModelNames.AUDIO,
        {
          id: Number(id),
          type,
          br,
          source,
          updateAt: Date.now(),
        },
        'modified'
      )
    })

    logger.info(`[cache] cacheAudio ${id}-${br}.${type}`)
  })
}

ipcMain.on('getApiCacheSync', (event, args) => {
  const { api, query } = args
  const data = getCache(api, query, false)
  event.returnValue = data
})
