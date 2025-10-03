// 更换手机

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    captcha: query.captcha,
    phone: query.phone,
    oldcaptcha: query.oldcaptcha,
    ctcode: query.ctcode || '86',
  }
  return request(
    `/api/user/replaceCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}
