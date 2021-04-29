import request from '@/utils/request';

/**
 * 手机登录
 * - phone: 手机号码
 * - password: 密码
 * - countrycode: 国家码，用于国外手机号登录，例如美国传入：1
 * - md5_password: md5加密后的密码,传入后 password 将失效
 * @param {Object} params
 * @param {string} params.phone
 * @param {string} params.password
 * @param {string=} params.countrycode
 * @param {string=} params.md5_password
 */
export function loginWithPhone(params) {
  return request({
    url: '/login/cellphone',
    method: 'post',
    params,
  });
}
/**
 * 邮箱登录
 * - email: 163 网易邮箱
 * - password: 密码
 * - md5_password: md5加密后的密码,传入后 password 将失效
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string=} params.md5_password
 */
export function loginWithEmail(params) {
  return request({
    url: '/login',
    method: 'post',
    params,
  });
}

/**
 * 刷新登录
 * 说明 : 调用此接口 , 可刷新登录状态
 * - 调用例子 : /login/refresh
 */
export function refreshCookie() {
  return request({
    url: '/login/refresh',
    method: 'post',
  });
}

/**
 * 退出登录
 * 说明 : 调用此接口 , 可退出登录
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  });
}
