export const enum AppleMusicTables {
  Album = 'Album',
  Artist = 'Artist',
}

export interface AppleMusicTablesStructures {
  [AppleMusicTables.Album]: {
    id: string
    json: string
  }
  [AppleMusicTables.Artist]: {
    id: string
    json: string
  }
}
