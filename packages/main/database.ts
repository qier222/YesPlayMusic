import Realm from 'realm'
import path from 'path'
import { app } from 'electron'

export enum ModelNames {
  ACCOUNT_DATA = 'AccountData',
  TRACK = 'Track',
  ALBUM = 'Album',
  ARTIST = 'Artist',
  PLAYLIST = 'Playlist',
  ARTIST_ALBUMS = 'ArtistAlbums',
  USER_PLAYLISTS = 'UserPlaylists',
  AUDIO = 'Audio',
}

export enum AudioSources {
  NETEASE = 'netease',
  KUWO = 'kuwo',
  QQ = 'qq',
  KUGOU = 'kugou',
  YOUTUBE = 'youtube',
  MIGU = 'migu',
  JOOX = 'joox',
  BILIBILI = 'bilibili',
}

const RegularSchemas = [
  ModelNames.USER_PLAYLISTS,
  ModelNames.ARTIST_ALBUMS,
  ModelNames.PLAYLIST,
  ModelNames.ALBUM,
  ModelNames.TRACK,
].map(name => ({
  primaryKey: 'id',
  name,
  properties: {
    id: 'int',
    json: 'string',
    updateAt: 'int',
  },
}))

export const realm = new Realm({
  path: path.resolve(app.getPath('userData'), './api_cache/db.realm'),
  schema: [
    ...RegularSchemas,
    {
      name: ModelNames.ACCOUNT_DATA,
      properties: {
        id: 'string',
        json: 'string',
        updateAt: 'int',
      },
      primaryKey: 'id',
    },
    {
      name: ModelNames.AUDIO,
      properties: {
        id: 'int',
        br: 'int',
        type: 'string',
        source: 'string',
        updateAt: 'int',
      },
      primaryKey: 'id',
    },
  ],
})

export const db = {
  get: (model: ModelNames, key: number | string) => {
    return realm.objectForPrimaryKey(model, key)
  },
  set: (model: ModelNames, key: number | string, value: any) => {
    realm.write(() => {
      realm.create(
        model,
        {
          id: key,
          updateAt: Date.now(),
          json: JSON.stringify(value),
        },
        'modified'
      )
    })
  },
  batchSet: (model: ModelNames, items: any[]) => {
    realm.write(() => {
      items.forEach(item => {
        realm.create(model, item, 'modified')
      })
    })
  },
  delete: (model: ModelNames, key: number) => {
    realm.delete(realm.objectForPrimaryKey(model, key))
  },
}
