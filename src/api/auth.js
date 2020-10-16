import request from "@/utils/request";

export function loginWithPhone(params) {
  //必选参数 :
  // phone: 手机号码
  // password: 密码
  // 可选参数 :
  // countrycode: 国家码，用于国外手机号登录，例如美国传入：1
  // md5_password: md5加密后的密码,传入后 password 将失效
  return request({
    url: "/login/cellphone",
    method: "post",
    params,
  });
}

export function loginWithEmail(params) {
  // 必选参数 :
  // email: 163 网易邮箱
  // password: 密码
  // 可选参数 :
  // md5_password: md5加密后的密码,传入后 password 将失效
  return request({
    url: "/login",
    method: "post",
    params,
  });
}

export function loginRefresh() {
  return request({
    url: "/login/refresh",
    method: "post",
  });
}

export function logout() {
  return request({
    url: "/logout",
    method: "post",
  });
}
