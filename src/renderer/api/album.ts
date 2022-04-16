import request from '@/renderer/utils/request'
import {
  FetchAlbumParams,
  FetchAlbumResponse,
  LikeAAlbumParams,
  LikeAAlbumResponse,
} from '@/shared/api/Album'

// 专辑详情
export function fetchAlbum(
  params: FetchAlbumParams,
  noCache: boolean
): Promise<FetchAlbumResponse> {
  const otherParams: { timestamp?: number } = {}
  if (noCache) otherParams.timestamp = new Date().getTime()
  return request({
    url: '/album',
    method: 'get',
    params: { ...params, ...otherParams },
  })
}

export function likeAAlbum(
  params: LikeAAlbumParams
): Promise<LikeAAlbumResponse> {
  return request({
    url: '/album/sub',
    method: 'post',
    params: {
      ...params,
      timestamp: Date.now(),
    },
  })
}
