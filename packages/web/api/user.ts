import request from '@/web/utils/request'
import {
  FetchUserAccountResponse,
  FetchUserPlaylistsParams,
  FetchUserPlaylistsResponse,
  FetchUserLikedTracksIDsParams,
  FetchUserLikedTracksIDsResponse,
  FetchUserAlbumsParams,
  FetchUserAlbumsResponse,
  FetchUserArtistsResponse,
  FetchListenedRecordsParams,
  FetchListenedRecordsResponse,
  FetchUserVideosResponse,
  FetchUserVideosParams,
  DailyCheckInResponse,
} from '@/shared/api/User'

// 获取用户详情
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
export function fetchUserAccount(): Promise<FetchUserAccountResponse> {
  return request({
    url: '/user/account',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  })
}

// 获取用户歌单
export function fetchUserPlaylists(
  params: FetchUserPlaylistsParams
): Promise<FetchUserPlaylistsResponse> {
  return request({
    url: '/user/playlist',
    method: 'get',
    params,
  })
}

// 获取用户收藏的歌曲ID列表
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

// 听歌打卡
export function scrobble(params: {
  id: number // track id
  sourceid: number // 歌单或专辑id
  time?: number // 已听秒数
}): Promise<null> {
  return request({
    url: '/scrobble',
    method: 'post',
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
  })
}

// 用户最近听歌排名
export function fetchListenedRecords(
  params: FetchListenedRecordsParams
): Promise<FetchListenedRecordsResponse> {
  return request({
    url: '/user/record',
    method: 'get',
    params: {
      ...params,
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
export function dailyCheckIn(type = 0): Promise<DailyCheckInResponse> {
  return request({
    url: '/daily/signin',
    method: 'post',
    params: {
      type,
      timestamp: new Date().getTime(),
    },
  })
}

export function fetchUserAlbums(params: FetchUserAlbumsParams): Promise<FetchUserAlbumsResponse> {
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
export function fetchUserArtists(): Promise<FetchUserArtistsResponse> {
  return request({
    url: '/artist/sublist',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  })
}

// 获取收藏的MV
export function fetchUserVideos(): Promise<FetchUserVideosResponse> {
  return request({
    url: '/mv/sublist',
    method: 'get',
    params: {
      limit: 1000,
      // offset: 1,
      timestamp: new Date().getTime(),
    },
  })
}

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
