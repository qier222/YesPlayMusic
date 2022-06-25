export enum ArtistApiNames {
  FetchArtist = 'fetchArtist',
  FetchArtistAlbums = 'fetchArtistAlbums',
  FetchSimilarArtists = 'fetchSimilarArtists',
}

// 歌手详情
export interface FetchArtistParams {
  id: number
}
export interface FetchArtistResponse {
  code: number
  more: boolean
  artist: Artist
  hotSongs: Track[]
}

// 获取歌手的专辑列表
export interface FetchArtistAlbumsParams {
  id: number
  limit?: number // default: 50
  offset?: number // default: 0
}
export interface FetchArtistAlbumsResponse {
  code: number
  hotAlbums: Album[]
  more: boolean
  artist: Artist
}

// 获取相似歌手
export interface FetchSimilarArtistsParams {
  id: number
}
export interface FetchSimilarArtistsResponse {
  code: number
  artists: Artist[]
}
