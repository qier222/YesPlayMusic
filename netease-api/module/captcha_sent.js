// 发送验证码

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    ctcode: query.ctcode || '86',
    secrete: 'music_middleuser_pclogin',
    cellphone: query.phone,
  }
  return request(`/api/sms/captcha/sent`, data, createOption(query, 'weapi'))
}
