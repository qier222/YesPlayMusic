export enum PlaylistApiNames {
  FETCH_PLAYLIST = 'fetchPlaylist',
  FETCH_RECOMMENDED_PLAYLISTS = 'fetchRecommendedPlaylists',
  FETCH_DAILY_RECOMMEND_PLAYLISTS = 'fetchDailyRecommendPlaylists',
  LIKE_A_PLAYLIST = 'likeAPlaylist',
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

// 推荐歌单
export interface FetchRecommendedPlaylistsParams {
  limit?: number
}
export interface FetchRecommendedPlaylistsResponse {
  code: number
  category: number
  hasTaste: boolean
  result: Playlist[]
}

// 每日推荐歌单（需要登录）
export interface FetchDailyRecommendPlaylistsResponse {
  code: number
  featureFirst: boolean
  haveRcmdSongs: boolean
  recommend: Playlist[]
}

export interface LikeAPlaylistParams {
  t: 1 | 2
  id: number
}
export interface LikeAPlaylistResponse {
  code: number
}
