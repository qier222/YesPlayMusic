import request from '@/renderer/utils/request'
import {
  FetchPlaylistParams,
  FetchPlaylistResponse,
  FetchRecommendedPlaylistsParams,
  FetchRecommendedPlaylistsResponse,
  FetchDailyRecommendPlaylistsResponse,
  LikeAPlaylistParams,
  LikeAPlaylistResponse,
} from '@/shared/api/Playlists'

// 歌单详情
export function fetchPlaylist(
  params: FetchPlaylistParams,
  noCache: boolean
): Promise<FetchPlaylistResponse> {
  const otherParams: { timestamp?: number } = {}
  if (noCache) otherParams.timestamp = new Date().getTime()
  if (!params.s) params.s = 0 // 网易云默认返回8个收藏者，这里设置为0，减少返回的JSON体积
  return request({
    url: '/playlist/detail',
    method: 'get',
    params: {
      ...params,
      ...otherParams,
    },
  })
}

// 推荐歌单
export function fetchRecommendedPlaylists(
  params: FetchRecommendedPlaylistsParams
): Promise<FetchRecommendedPlaylistsResponse> {
  return request({
    url: '/personalized',
    method: 'get',
    params,
  })
}

// 每日推荐歌单（需要登录）

export function fetchDailyRecommendPlaylists(): Promise<FetchDailyRecommendPlaylistsResponse> {
  return request({
    url: '/recommend/resource',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}

export function likeAPlaylist(
  params: LikeAPlaylistParams
): Promise<LikeAPlaylistResponse> {
  return request({
    url: '/playlist/subscribe',
    method: 'post',
    params: {
      ...params,
      timestamp: Date.now(),
    },
  })
}
