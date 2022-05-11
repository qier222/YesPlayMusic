export enum AlbumApiNames {
  FetchAlbum = 'fetchAlbum',
}

// 专辑详情
export interface FetchAlbumParams {
  id: number
}
export interface FetchAlbumResponse {
  code: number
  resourceState: boolean
  album: Album
  songs: Track[]
  description: string
}

export interface LikeAAlbumParams {
  t: 1 | 2
  id: number
}
export interface LikeAAlbumResponse {
  code: number
}
