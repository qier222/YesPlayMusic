import request from '@/web/utils/request'
import {
  FetchArtistParams,
  FetchArtistResponse,
  FetchArtistAlbumsParams,
  FetchArtistAlbumsResponse,
  FetchSimilarArtistsParams,
  FetchSimilarArtistsResponse,
} from '@/shared/api/Artist'

// 歌手详情
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
export function fetchArtistAlbums(
  params: FetchArtistAlbumsParams
): Promise<FetchArtistAlbumsResponse> {
  return request({
    url: 'artist/album',
    method: 'get',
    params,
  })
}

export function fetchSimilarArtists(
  params: FetchSimilarArtistsParams
): Promise<FetchSimilarArtistsResponse> {
  return request({
    url: 'simi/artist',
    method: 'get',
    params,
  })
}
