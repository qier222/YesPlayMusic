import request from "@/utils/request";

export function login(params) {
  //     必选参数 :
  // phone: 手机号码
  // password: 密码
  // 可选参数 :
  // countrycode: 国家码，用于国外手机号登陆，例如美国传入：1
  // md5_password: md5加密后的密码,传入后 password 将失效
  return request({
    url: "/login/cellphone",
    method: "get",
    params,
  });
}

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
    uid,
  });
}
