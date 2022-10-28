export const enum NeteaseTables {
  AccountData = 'AccountData',
  Album = 'Album',
  Artist = 'Artist',
  ArtistAlbum = 'ArtistAlbum',
  Audio = 'Audio',
  Lyric = 'Lyric',
  Playlist = 'Playlist',
  Track = 'Track',
}
interface CommonTableStructure {
  id: number
  json: string
  updatedAt: number
}
export interface NeteaseTablesStructures {
  [NeteaseTables.AccountData]: {
    id: string
    json: string
    updatedAt: number
  }
  [NeteaseTables.Album]: CommonTableStructure
  [NeteaseTables.Artist]: CommonTableStructure
  [NeteaseTables.ArtistAlbum]: CommonTableStructure
  [NeteaseTables.Audio]: {
    id: number
    br: number
    type: 'mp3' | 'flac' | 'ogg' | 'wav' | 'm4a' | 'aac' | 'unknown' | 'opus'
    source:
      | 'unknown'
      | 'netease'
      | 'migu'
      | 'kuwo'
      | 'kugou'
      | 'youtube'
      | 'qq'
      | 'bilibili'
      | 'joox'
    queriedAt: number
  }
  [NeteaseTables.Lyric]: CommonTableStructure
  [NeteaseTables.Playlist]: CommonTableStructure
  [NeteaseTables.Track]: CommonTableStructure
}
