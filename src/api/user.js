import request from "@/utils/request";

export function userDetail(uid) {
  return request({
    url: "/user/detail",
    method: "get",
    params: {
      uid,
    },
  });
}

export function userPlaylist(params) {
  // limit : 返回数量 , 默认为 30
  // offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
  return request({
    url: "/user/playlist",
    method: "get",
    params,
  });
}

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
