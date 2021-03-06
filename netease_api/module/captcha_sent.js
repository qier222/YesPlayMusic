// 发送验证码

module.exports = (query, request) => {
  const data = {
    ctcode: query.ctcode || '86',
    cellphone: query.phone,
  }
  return request('POST', `https://music.163.com/api/sms/captcha/sent`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
