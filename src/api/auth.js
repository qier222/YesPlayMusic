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
 * 二维码key生成接口
 */
export function loginQrCodeKey() {
  return request({
    url: '/login/qr/key',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 二维码生成接口
 * 说明: 调用此接口传入上一个接口生成的key可生成二维码图片的base64和二维码信息,
 * 可使用base64展示图片,或者使用二维码信息内容自行使用第三方二维码生产库渲染二维码
 * @param {Object} params
 * @param {string} params.key
 * @param {string=} params.qrimg 传入后会额外返回二维码图片base64编码
 */
export function loginQrCodeCreate(params) {
  return request({
    url: '/login/qr/create',
    method: 'get',
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 二维码检测扫码状态接口
 * 说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)
 * @param {string} key
 */
export function loginQrCodeCheck(key) {
  return request({
    url: '/login/qr/check',
    method: 'get',
    params: {
      key,
      timestamp: new Date().getTime(),
    },
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
