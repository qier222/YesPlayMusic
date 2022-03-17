import Realm from 'realm'
import type { FetchTracksResponse } from '../renderer/src/api/track'
import type { FetchAlbumResponse } from '../renderer/src/api/album'

enum ModelNames {
  TRACK = 'Track',
  ALBUM = 'Album',
  ARTIST = 'Artist',
  PLAYLIST = 'Playlist',
}

const universalProperties = {
  id: 'int',
  json: 'string',
  updateAt: 'int',
}

const TrackSchema = {
  name: ModelNames.TRACK,
  properties: universalProperties,
  primaryKey: 'id',
}

const AlbumSchema = {
  name: ModelNames.ALBUM,
  properties: universalProperties,
  primaryKey: 'id',
}

const PlaylistSchema = {
  name: ModelNames.PLAYLIST,
  properties: universalProperties,
  primaryKey: 'id',
}

const realm = new Realm({
  path: './.tmp/db.realm',
  schema: [TrackSchema, AlbumSchema, PlaylistSchema],
})

export const database = {
  get: (model: ModelNames, key: number) => {
    return realm.objectForPrimaryKey(model, key)
  },
  set: (model: ModelNames, key: number, value: any) => {
    realm.create(
      model,
      {
        id: key,
        updateAt: Date.now(),
        json: JSON.stringify(value),
      },
      'modified'
    )
  },
  delete: (model: ModelNames, key: number) => {
    realm.delete(realm.objectForPrimaryKey(model, key))
  },
}

export async function setTracks(data: FetchTracksResponse) {
  if (!data.songs) return
  const tracks = data.songs
  realm.write(() => {
    tracks.forEach(track => {
      database.set(ModelNames.TRACK, track.id, track)
    })
  })
}

export async function setCache(api: string, data: any) {
  switch (api) {
    case 'song_detail': {
      setTracks(data)
      return
    }
    case 'album': {
      if (!data.album) return
      realm.write(() => {
        database.set(ModelNames.ALBUM, Number(data.album.id), data)
      })
      return
    }
    case 'playlist_detail': {
      if (!data.playlist) return
      realm.write(() => {
        database.set(ModelNames.PLAYLIST, Number(data.playlist.id), data)
      })
      return
    }
  }
}

export function getCache(api: string, query: any) {
  switch (api) {
    case 'song_detail': {
      const ids: string[] = query?.ids.split(',')
      const idsQuery = ids.map(id => `id = ${id}`).join(' OR ')
      const tracksRaw = realm
        .objects(ModelNames.TRACK)
        .filtered(`(${idsQuery})`)
      if (tracksRaw.length !== ids.length) {
        return
      }
      const tracks = tracksRaw.map(track => JSON.parse(track.json))

      return {
        code: 200,
        songs: tracks,
        privileges: {},
      }
    }
    case 'album': {
      if (!query?.id) return
      const album = realm.objectForPrimaryKey(
        ModelNames.ALBUM,
        Number(query?.id)
      )?.json
      if (album) return JSON.parse(album)
      return
    }
    case 'playlist_detail': {
      if (!query?.id) return
      const playlist = realm.objectForPrimaryKey(
        ModelNames.PLAYLIST,
        Number(query?.id)
      )?.json
      if (playlist) return JSON.parse(playlist)
      return
    }
  }
}
