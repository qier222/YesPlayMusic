export enum ArtistApiNames {
  FetchArtist = 'fetchArtist',
  FetchArtistAlbums = 'fetchArtistAlbums',
  FetchSimilarArtists = 'fetchSimilarArtists',
  FetchArtistMV = 'fetchArtistMV',
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

// 获取歌手MV
export interface FetchArtistMVParams {
  id: number
  offset?: number
  limit?: number
}
export interface FetchArtistMVResponse {
  code: number
  hasMore: boolean
  time: number
  mvs: {
    artist: Artist
    artistName: string
    duration: number
    id: number
    imgurl: string
    imgurl16v9: string
    name: string
    playCount: number
    publishTime: string
    status: number
    subed: boolean
  }[]
}

// 收藏歌手
export interface LikeAArtistParams {
  id: number
  like: boolean
}
export interface LikeAArtistResponse {
  code: number
  data: null
  message: string
}
