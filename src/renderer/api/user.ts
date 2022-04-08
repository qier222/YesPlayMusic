import request from '@/renderer/utils/request'

export enum UserApiNames {
  FETCH_USER_ACCOUNT = 'fetchUserAccount',
  FETCH_USER_LIKED_TRACKS_IDS = 'fetchUserLikedTracksIDs',
  FETCH_USER_PLAYLISTS = 'fetchUserPlaylists',
  FETCH_USER_ALBUMS = 'fetchUserAlbums',
  FETCH_USER_ARTIST = 'fetchUserArtists',
}

/**
 * 获取用户详情
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 * - uid : 用户 id
 * @param {number} uid
 */
export function userDetail(uid: number) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: {
      uid,
      timestamp: new Date().getTime(),
    },
  })
}

// 获取账号详情
export interface fetchUserAccountResponse {
  code: number
  account: {
    anonimousUser: boolean
    ban: number
    baoyueVersion: number
    createTime: number
    donateVersion: number
    id: number
    paidFee: boolean
    status: number
    tokenVersion: number
    type: number
    userName: string
    vipType: number
    whitelistAuthority: number
  } | null
  profile: {
    userId: number
    userType: number
    nickname: string
    avatarImgId: number
    avatarUrl: string
    backgroundImgId: number
    backgroundUrl: string
    signature: string
    createTime: number
    userName: string
    accountType: number
    shortUserName: string
    birthday: number
    authority: number
    gender: number
    accountStatus: number
    province: number
    city: number
    authStatus: number
    description: string | null
    detailDescription: string | null
    defaultAvatar: boolean
    expertTags: [] | null
    experts: [] | null
    djStatus: number
    locationStatus: number
    vipType: number
    followed: boolean
    mutual: boolean
    authenticated: boolean
    lastLoginTime: number
    lastLoginIP: string
    remarkName: string | null
    viptypeVersion: number
    authenticationTypes: number
    avatarDetail: string | null
    anchor: boolean
  } | null
}
export function fetchUserAccount(): Promise<fetchUserAccountResponse> {
  return request({
    url: '/user/account',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  })
}

// 获取用户歌单
export interface FetchUserPlaylistsParams {
  uid: number
  offset: number
  limit?: number // default 30
}
export interface FetchUserPlaylistsResponse {
  code: number
  more: boolean
  version: string
  playlist: Playlist[]
}
export function fetchUserPlaylists(
  params: FetchUserPlaylistsParams
): Promise<FetchUserPlaylistsResponse> {
  return request({
    url: '/user/playlist',
    method: 'get',
    params,
  })
}

export interface FetchUserLikedTracksIDsParams {
  uid: number
}
export interface FetchUserLikedTracksIDsResponse {
  code: number
  checkPoint: number
  ids: number[]
}
export function fetchUserLikedTracksIDs(
  params: FetchUserLikedTracksIDsParams
): Promise<FetchUserLikedTracksIDsResponse> {
  return request({
    url: '/likelist',
    method: 'get',
    params: {
      uid: params.uid,
      timestamp: new Date().getTime(),
    },
  })
}

/**
 * 每日签到
 * 说明 : 调用此接口可签到获取积分
 * -  type: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
 * @param {number} type
 */
export function dailySignin(type = 0) {
  return request({
    url: '/daily_signin',
    method: 'post',
    params: {
      type,
      timestamp: new Date().getTime(),
    },
  })
}

export interface FetchUserAlbumsParams {
  offset?: number // default 0
  limit?: number // default 25
}
export interface FetchUserAlbumsResponse {
  code: number
  hasMore: boolean
  paidCount: number
  count: number
  data: Album[]
}
export function fetchUserAlbums(
  params: FetchUserAlbumsParams
): Promise<FetchUserAlbumsResponse> {
  return request({
    url: '/album/sublist',
    method: 'get',
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
  })
}

// 获取收藏的歌手
export interface FetchUserArtistsResponse {
  code: number
  hasMore: boolean
  count: number
  data: Artist[]
}
export function fetchUserArtists(): Promise<FetchUserArtistsResponse> {
  return request({
    url: '/artist/sublist',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  })
}

/**
 * 获取收藏的MV（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的MV
 */
// export function likedMVs(params) {
//   return request({
//     url: '/mv/sublist',
//     method: 'get',
//     params: {
//       limit: params.limit,
//       timestamp: new Date().getTime(),
//     },
//   })
// }

/**
 * 上传歌曲到云盘（需要登录）
 */
// export function uploadSong(file) {
//   let formData = new FormData()
//   formData.append('songFile', file)
//   return request({
//     url: '/cloud',
//     method: 'post',
//     params: {
//       timestamp: new Date().getTime(),
//     },
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//     timeout: 200000,
//   }).catch(error => {
//     alert(`上传失败，Error: ${error}`)
//   })
// }

/**
 * 获取云盘歌曲（需要登录）
 * 说明 : 登录后调用此接口 , 可获取云盘数据 , 获取的数据没有对应 url, 需要再调用一 次 /song/url 获取 url
 * - limit : 返回数量 , 默认为 200
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*200, 其中 200 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.limit
 * @param {number=} params.offset
 */
// export function cloudDisk(params = {}) {
//   params.timestamp = new Date().getTime()
//   return request({
//     url: '/user/cloud',
//     method: 'get',
//     params,
//   })
// }

/**
 * 获取云盘歌曲详情（需要登录）
 */
// export function cloudDiskTrackDetail(id) {
//   return request({
//     url: '/user/cloud/detail',
//     method: 'get',
//     params: {
//       timestamp: new Date().getTime(),
//       id,
//     },
//   })
// }

/**
 * 删除云盘歌曲（需要登录）
 * @param {Array} id
 */
// export function cloudDiskTrackDelete(id) {
//   return request({
//     url: '/user/cloud/del',
//     method: 'get',
//     params: {
//       timestamp: new Date().getTime(),
//       id,
//     },
//   })
// }
