import request from '@/utils/request'

export enum PlaylistApiNames {
  FETCH_PLAYLIST = 'fetchPlaylist',
  FETCH_RECOMMENDED_PLAYLISTS = 'fetchRecommendedPlaylists',
  FETCH_DAILY_RECOMMEND_PLAYLISTS = 'fetchDailyRecommendPlaylists',
}

// 歌单详情
export interface FetchPlaylistParams {
  id: number
  s?: number // 歌单最近的 s 个收藏者
}
export interface FetchPlaylistResponse {
  code: number
  playlist: Playlist
  privileges: unknown // TODO: unknown type
  relatedVideos: null
  resEntrance: null
  sharedPrivilege: null
  urls: null
}
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
interface FetchRecommendedPlaylistsParams {
  limit?: number
}
export interface FetchRecommendedPlaylistsResponse {
  code: number
  category: number
  hasTaste: boolean
  result: Playlist[]
}
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
export interface FetchDailyRecommendPlaylistsResponse {
  code: number
  featureFirst: boolean
  haveRcmdSongs: boolean
  recommend: Playlist[]
}
export function fetchDailyRecommendPlaylists(): Promise<FetchDailyRecommendPlaylistsResponse> {
  return request({
    url: '/recommend/resource',
    method: 'get',
  })
}
