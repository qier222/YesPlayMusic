import request from "@/utils/request";

/**
 * 获取用户详情
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 * - uid : 用户 id
 * @param {number} uid
 */
export function userDetail(uid) {
  return request({
    url: "/user/detail",
    method: "get",
    params: {
      uid,
    },
  });
}

/**
 * 获取用户歌单
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
 * - uid : 用户 id
 * - limit : 返回数量 , 默认为 30
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.uid
 * @param {number} params.limit
 * @param {number=} params.offset
 */
export function userPlaylist(params) {
  return request({
    url: "/user/playlist",
    method: "get",
    params,
  });
}

/**
 * 喜欢音乐列表
 * 说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐id列表(id数组)
 * - uid: 用户 id
 * @param {number} uid
 */
export function userLikedSongsIDs(uid) {
  return request({
    url: "/likelist",
    method: "get",
    params: {
      uid,
      timestamp: new Date().getTime(),
    },
  });
}

export function dailySignin(type = 0) {
  //可选参数 : type: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
  return request({
    url: "/daily_signin",
    method: "post",
    params: {
      type,
    },
  });
}
