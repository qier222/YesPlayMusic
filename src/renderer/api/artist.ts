import request from '@/renderer/utils/request'

export enum ArtistApiNames {
  FETCH_ARTIST = 'fetchArtist',
  FETCH_ARTIST_ALBUMS = 'fetchArtistAlbums',
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
export function fetchArtist(
  params: FetchArtistParams,
  noCache: boolean
): Promise<FetchArtistResponse> {
  const otherParams: { timestamp?: number } = {}
  if (noCache) otherParams.timestamp = new Date().getTime()
  return request({
    url: '/artists',
    method: 'get',
    params: { ...params, ...otherParams },
  })
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
export function fetchArtistAlbums(
  params: FetchArtistAlbumsParams
): Promise<FetchArtistAlbumsResponse> {
  return request({
    url: 'artist/album',
    method: 'get',
    params,
  })
}
