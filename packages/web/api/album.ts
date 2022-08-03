import request from '@/web/utils/request'
import {
  FetchAlbumParams,
  FetchAlbumResponse,
  LikeAAlbumParams,
  LikeAAlbumResponse,
} from '@/shared/api/Album'

// 专辑详情
export function fetchAlbum(
  params: FetchAlbumParams
): Promise<FetchAlbumResponse> {
  return request({
    url: '/album',
    method: 'get',
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
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
