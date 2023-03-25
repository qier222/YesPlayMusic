import request from '@/web/utils/request'
import {
  FetchArtistParams,
  FetchArtistResponse,
  FetchArtistAlbumsParams,
  FetchArtistAlbumsResponse,
  FetchSimilarArtistsParams,
  FetchSimilarArtistsResponse,
  FetchArtistMVParams,
  FetchArtistMVResponse,
  LikeAArtistParams,
  LikeAArtistResponse,
} from '@/shared/api/Artist'

// 歌手详情
export function fetchArtist(params: FetchArtistParams): Promise<FetchArtistResponse> {
  return request({
    url: '/artists',
    method: 'get',
    params: { ...params, timestamp: new Date().getTime() },
  })
}

// 获取歌手的专辑列表
export function fetchArtistAlbums(
  params: FetchArtistAlbumsParams
): Promise<FetchArtistAlbumsResponse> {
  return request({
    url: 'artist/album',
    method: 'get',
    params,
  })
}

// 获取相似歌手
export function fetchSimilarArtists(
  params: FetchSimilarArtistsParams
): Promise<FetchSimilarArtistsResponse> {
  return request({
    url: 'simi/artist',
    method: 'get',
    params,
  })
}

// 获取歌手MV
export function fetchArtistMV(params: FetchArtistMVParams): Promise<FetchArtistMVResponse> {
  return request({
    url: '/artist/mv',
    method: 'get',
    params,
  })
}

// 收藏歌手
export function likeAArtist(params: LikeAArtistParams): Promise<LikeAArtistResponse> {
  return request({
    url: 'artist/sub',
    method: 'get',
    params: {
      id: params.id,
      t: Number(params.like),
    },
  })
}
