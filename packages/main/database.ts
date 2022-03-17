import Realm from 'realm'
import type { FetchTracksResponse } from '../renderer/src/api/track'

enum ModelNames {
  TRACK = 'Track',
}

const TrackSchema = {
  name: ModelNames.TRACK,
  properties: {
    id: 'int',
    json: 'string',
    updateAt: 'int',
  },
  primaryKey: 'id',
}

const realm = new Realm({
  path: './dist/db.realm',
  schema: [TrackSchema],
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
        updateAt: ~~(Date.now() / 1000),
        json: JSON.stringify(value),
      },
      'modified'
    )
  },
  delete: (model: ModelNames, key: number) => {
    realm.delete(realm.objectForPrimaryKey(model, key))
  },
}

export function setTracks(data: FetchTracksResponse) {
  const tracks = data.songs
  if (!data.songs) return
  const write = async () =>
    realm.write(() => {
      tracks.forEach(track => {
        database.set(ModelNames.TRACK, track.id, track)
      })
    })
  write()
}

export async function setCache(api: string, data: any) {
  switch (api) {
    case 'song_detail':
      setTracks(data)
  }
}

export function getCache(api: string, query: any) {
  switch (api) {
    case 'song_detail': {
      const ids: string[] = query.ids.split(',')
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
  }
}
